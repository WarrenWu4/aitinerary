import base64
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def upload_file(file):
    if file and allowed_file(file.filename):
        try:
            # Read the file and encode it in base64
            file_content = file.read()
            b64_image = base64.b64encode(file_content).decode('utf-8')
            
            # Create a data URL that can be directly used in img src
            file_ext = file.filename.rsplit('.', 1)[1].lower()
            data_url = f"data:image/{file_ext};base64,{b64_image}"
            
            return data_url
                
        except Exception as e:
            print(f"Error encoding image: {e}")
            return None
    return None
