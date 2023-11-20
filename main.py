import os
from Backend.API import app                                                               
if __name__ == "__main__":                                             
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port)