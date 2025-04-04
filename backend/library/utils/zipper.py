import io
import zipfile

def zip_files_from_memory(file_dict):
    """
    file_dict: a dict of {filename: file_bytes}
    Returns: zip file as bytes
    """
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for name, data in file_dict.items():
            zip_file.writestr(name, data)
    buffer.seek(0)
    return buffer
