use std::fs;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;
use webp::Encoder;

#[tauri::command]
pub async fn convert_images_to_webp(folder_path: String) -> Result<Vec<String>, String> {
    let mut converted_files = Vec::new();
    let path = PathBuf::from(&folder_path);

    if !path.exists() {
        return Err("Folder does not exist".to_string());
    }

    for entry in WalkDir::new(&path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| {
            let path = e.path();
            path.is_file()
                && (path
                    .extension()
                    .map_or(false, |ext| ext == "jpg" || ext == "jpeg" || ext == "png"))
        })
    {
        let input_path = entry.path();
        let output_path = input_path.with_extension("webp");

        match convert_single_image(input_path, &output_path) {
            Ok(_) => {
                converted_files.push(output_path.to_string_lossy().to_string());
            }
            Err(e) => {
                return Err(format!("Error converting {}: {}", input_path.display(), e));
            }
        }
    }

    Ok(converted_files)
}

fn convert_single_image(input_path: &Path, output_path: &Path) -> Result<(), String> {
    let img = image::open(input_path).map_err(|e| format!("Failed to open image: {}", e))?;

    let (width, height) = (img.width(), img.height());
    let img_buffer = img.to_rgba8();

    let encoder = Encoder::from_rgba(&img_buffer, width, height);
    let webp_data = encoder.encode(100.0);

    fs::write(output_path, &*webp_data).map_err(|e| format!("Failed to write WebP file: {}", e))?;

    Ok(())
}
