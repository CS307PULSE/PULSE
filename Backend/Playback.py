import spotipy
import subprocess
import time
import User

class Playback:
    def init(self,devices,shuffle,repeat, currentlyplaying):
        devices = get_devices()

    def begin_player():
       while True:
        playback_info = get_current_playback()
        print("Current Playback:", playback_info)
    
        time.sleep(1)

    def get_current_playback():
        try:
         result = subprocess.run(["current_playback"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=1)
         if result.returncode == 0:
            return result.stdout.strip()
         else:
            return "Error: Command failed"
        except subprocess.TimeoutExpired:
            return "Error: Timeout"

