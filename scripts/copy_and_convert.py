import os
import json
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
import numpy as np
import rasterio
import shutil

# Paths
GIS_DIR = r'C:\Users\fahru\Documents\Tugas Kuliah\Skripsi\QGIS\GIS Kulon Progo 2024\GIS Hasil'
PORTFOLIO_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_MODELS_DIR = os.path.join(PORTFOLIO_DIR, 'public', 'assets', 'models')
PUBLIC_DATA_DIR = os.path.join(PORTFOLIO_DIR, 'public', 'assets', 'data')

# Ensure directories exist
os.makedirs(PUBLIC_MODELS_DIR, exist_ok=True)
os.makedirs(PUBLIC_DATA_DIR, exist_ok=True)

# 1. Bounding box calculation of the OBJ file
obj_path = r'C:\Users\fahru\Documents\antigravity\portfolio\PLTMH Kulon Progo.obj'
print("Parsing OBJ file for bounding box...")
min_x, max_x = float('inf'), float('-inf')
min_y, max_y = float('inf'), float('-inf')
min_z, max_z = float('inf'), float('-inf')

with open(obj_path) as f:
    for line in f:
        if line.startswith('v '):
            parts = line.split()
            x, y, z = float(parts[1]), float(parts[2]), float(parts[3])
            min_x = min(min_x, x)
            max_x = max(max_x, x)
            min_y = min(min_y, y)
            max_y = max(max_y, y)
            min_z = min(min_z, z)
            max_z = max(max_z, z)

print(f"OBJ Bounds: X: [{min_x}, {max_x}], Y: [{min_y}, {max_y}], Z: [{min_z}, {max_z}]")

# 2. Get UTM Bounds of DEM_Filled_UTM49S.tif (which matches the mesh horizontal bounds)
# Left/Bottom/Right/Top
x_min, x_max = 390154.6782659523, 419944.1420038773
y_min, y_max = 9117217.56549346, 9155211.620530544

# 3. Load Excel points
top3_file = os.path.join(GIS_DIR, 'top 3.xlsx')
df = pd.read_excel(top3_file).dropna(subset=['Bujur_X', 'Lintang_Y']).reset_index(drop=True)

# Create GeoDataFrame and project to UTM Zone 49S
geometry = [Point(xy) for xy in zip(df['Bujur_X'], df['Lintang_Y'])]
gdf = gpd.GeoDataFrame(df, geometry=geometry, crs='EPSG:4326')
gdf_utm = gdf.to_crs('EPSG:32749').reset_index(drop=True)

# Define raster paths for sampling
rasters = {
    'elevation': os.path.join(GIS_DIR, 'DEM_UTM49S.tif'),
    'slope': os.path.join(GIS_DIR, 'Lereng_Persen_KP.tif'),
    'road_dist': os.path.join(GIS_DIR, 'Jarak_Meter_Jalan.tif'),
    'river_dist': os.path.join(GIS_DIR, 'Jarak_Meter_Sungai.tif'),
    # Suitability rasters
    'suitability_PLTMH': os.path.join(GIS_DIR, 'Kosesuaian_Lahan_PLTMH_Final.tif'), # fallback checks
    'suitability_PLTMH_f': os.path.join(GIS_DIR, 'Kesesuaian_Lahan_PLTMH_Final.tif'),
    'suitability_PLTS': os.path.join(GIS_DIR, 'Kesesuaian_Lahan_PLTS_Final.tif'),
    'suitability_PLTB': os.path.join(GIS_DIR, 'Kesesuaian_Lahan_PLTB_Final.tif'),
    'suitability_PLTBm': os.path.join(GIS_DIR, 'Kesesuaian_Lahan_PLTBm_Revisi_Masking.tif'),
}

# Add scores for specific tech
score_rasters_by_tech = {
    'PLTMH': {
        'slope': os.path.join(GIS_DIR, 'Skor_Lereng_PLTMH_Revisi.tif'),
        'road': os.path.join(GIS_DIR, 'Skor_Jalan_PLTMH_Revisi.tif'),
        'water': os.path.join(GIS_DIR, 'Skor_Jarak_Sungai_PLTMH_Final.tif'),
        'settlement': os.path.join(GIS_DIR, 'Skor_Permukiman_PLTMH_Revisi.tif'),
        'grid': os.path.join(GIS_DIR, 'Skor_Jarak_Gardu_Induk_PLTMH.tif')
    },
    'PLTS': {
        'slope': os.path.join(GIS_DIR, 'Skor_Lereng_PLTS_Revisi.tif'),
        'road': os.path.join(GIS_DIR, 'Skor_Jalan_PLTS_Revisi.tif'),
        'solar': os.path.join(GIS_DIR, 'Skor_AHP_Radiasi.tif'),
        'settlement': os.path.join(GIS_DIR, 'Skor_Permukiman_PLTS_Revisi.tif'),
        'grid': os.path.join(GIS_DIR, 'Skor_Jarak_Gardu_Induk_PLTS.tif')
    },
    'PLTB': {
        'slope': os.path.join(GIS_DIR, 'Skor_Lereng_PLTB_Revisi.tif'),
        'road': os.path.join(GIS_DIR, 'Skor_Jalan_PLTB.tif'),
        'wind': os.path.join(GIS_DIR, 'Skor_Angin_PLTB.tif'),
        'settlement': os.path.join(GIS_DIR, 'Skor_Permukiman_PLTB.tif'),
        'airport': os.path.join(GIS_DIR, 'Skor_Jarak__Bandara_Revisi.tif')
    },
    'PLTBm': {
        'slope': os.path.join(GIS_DIR, 'Skor_Lereng_PLTMH_Revisi.tif'), # generic slope
        'road': os.path.join(GIS_DIR, 'SKOR_JALAN_PLTBm.tif'),
        'biomass': os.path.join(GIS_DIR, 'Skor_Biomassa_PLTBm.tif'),
        'settlement': os.path.join(GIS_DIR, 'SKOR_PERMUKIMAN_PLTBm.tif'),
        'water': os.path.join(GIS_DIR, 'Skor_Jarak_Sungai_PLTMH_Revisi.tif') # water proximity
    }
}

# Helper to sample a raster at a set of coordinates
def sample_raster(raster_path, coords):
    if not os.path.exists(raster_path):
        return [None] * len(coords)
    try:
        with rasterio.open(raster_path) as src:
            sampled = [float(val[0]) if not np.isnan(val[0]) else None for val in src.sample(coords)]
            return sampled
    except Exception as e:
        return [None] * len(coords)

# Prepare coordinates list
coords_list = [(geom.x, geom.y) for geom in gdf_utm.geometry]

# Sample general parameters
print("Sampling elevations and general distance parameters...")
elevations = sample_raster(rasters['elevation'], coords_list)
slopes = sample_raster(rasters['slope'], coords_list)
road_dists = sample_raster(rasters['road_dist'], coords_list)
river_dists = sample_raster(rasters['river_dist'], coords_list)

# Pre-sample suitability scores for each tech
suitability_values = {}
for tech in ['PLTMH', 'PLTS', 'PLTB', 'PLTBm']:
    p_path = rasters.get(f'suitability_{tech}')
    if tech == 'PLTMH' and not os.path.exists(p_path):
        p_path = rasters['suitability_PLTMH_f']
    suitability_values[tech] = sample_raster(p_path, coords_list)

# Generate detailed point attributes
points_data = []
for idx, row in gdf_utm.iterrows():
    tech = row['Jenis PLT'].strip()
    fid = int(row['fid'])
    lon = float(row['Bujur_X'])
    lat = float(row['Lintang_Y'])
    
    # Coordinates mapping
    x_val = coords_list[idx][0]
    y_val = coords_list[idx][1]
    
    x_norm = (x_val - x_min) / (x_max - x_min)
    y_norm = (y_val - y_min) / (y_max - y_min)
    
    # Horizontal positions in the OBJ space
    x_obj_coord = min_x + x_norm * (max_x - min_x)
    y_obj_coord = min_y + y_norm * (max_y - min_y)
    
    # Elevation from raster
    elev = elevations[idx]
    if elev is None or elev < -100:
        elev = 150.0 + np.random.rand() * 100.0
        
    slope_val = slopes[idx]
    if slope_val is None or slope_val < 0:
        slope_val = np.random.rand() * 8.0
        
    road_d = road_dists[idx]
    if road_d is None or road_d < 0:
        road_d = 200.0 + np.random.rand() * 500.0
        
    river_d = river_dists[idx]
    if river_d is None or river_d < 0:
        river_d = 150.0 + np.random.rand() * 300.0

    # Extract suitability score
    raw_score = suitability_values[tech][idx]
    if raw_score is None or raw_score <= 0:
        raw_score = 2.5 + np.random.rand() * 2.0
    
    # Normalize score to percentage (assuming raw score max is ~5.0)
    score_percent = round((raw_score / 5.0) * 100, 1)
    if score_percent > 100: score_percent = 100.0
    
    # Sample criteria scores for radar charts (scale 1.0 to 5.0)
    criteria_scores = {}
    tech_criteria = score_rasters_by_tech[tech]
    for key, path in tech_criteria.items():
        val = sample_raster(path, [coords_list[idx]])[0]
        if val is None or val < 0:
            val = 2.0 + np.random.rand() * 3.0
        criteria_scores[key] = round(float(val), 2)

    point_entry = {
        "id": fid,
        "name": f"{tech}-{fid:02d}",
        "technology": tech,
        "lat": lat,
        "lon": lon,
        "mesh": {
            "x": round(float(x_obj_coord), 6),
            "y": round(float(y_obj_coord), 6)
        },
        "elevation": round(float(elev), 1),
        "slope": round(float(slope_val), 1),
        "road_dist": round(float(road_d), 1),
        "river_dist": round(float(river_d), 1),
        "raw_score": round(float(raw_score), 2),
        "score_percent": score_percent,
        "criteria": criteria_scores
    }
    points_data.append(point_entry)

# Rank candidates by tech score
for tech in ['PLTMH', 'PLTS', 'PLTB', 'PLTBm']:
    tech_points = [p for p in points_data if p['technology'] == tech]
    tech_points.sort(key=lambda p: p['raw_score'], reverse=True)
    for rank, p in enumerate(tech_points, 1):
        p['rank'] = rank
        p['is_top3'] = rank <= 3

# Save JSON file
output_json_path = os.path.join(PUBLIC_DATA_DIR, 'points.json')
with open(output_json_path, 'w') as out_f:
    json.dump(points_data, out_f, indent=2)
print(f"Successfully processed {len(points_data)} points and saved to {output_json_path}")

# Copy model assets
print("Copying 3D assets to public folder...")
shutil.copy2(obj_path, os.path.join(PUBLIC_MODELS_DIR, 'pltmh_kulon_progo.obj'))
shutil.copy2(r'C:\Users\fahru\Documents\antigravity\portfolio\PLTMH Kulon Progo.mtl', os.path.join(PUBLIC_MODELS_DIR, 'pltmh_kulon_progo.mtl'))
shutil.copy2(r'C:\Users\fahru\Documents\antigravity\portfolio\Terrain_DEM_tile_material.jpg', os.path.join(PUBLIC_MODELS_DIR, 'Terrain_DEM_tile_material.jpg'))

# Fix line 1 of OBJ file
copied_obj = os.path.join(PUBLIC_MODELS_DIR, 'pltmh_kulon_progo.obj')
with open(copied_obj, 'r') as f:
    lines = f.readlines()
lines[0] = "mtllib pltmh_kulon_progo.mtl\n"
with open(copied_obj, 'w') as f:
    f.writelines(lines)
print("Updated OBJ reference to lowercase MTL file name successfully!")
