import spotipy
import multiprocessing
import time
import User
import json
from Exceptions import ErrorHandler
from datetime import datetime
import requests
import pytz
from DatabaseConnector import DatabaseConnector
import Stats
from DatabaseConnector import db_config

def get_data_info_with_retry(self, url, headers, max_retries=3):
        if self.hit_rate_limit:
            return None

        for attempt in range(max_retries):
            try:
                response = requests.get(url, headers=headers)
                response.raise_for_status()  # Check for HTTP errors
                track_data = response.json()
                return track_data
            except requests.exceptions.RequestException as e:
                print(f"Attempt {attempt + 1} failed: {e}")
                if response.status_code == 429:
                    # If rate-limited, wait and retry
                    retry_after = int(response.headers.get('Retry-After', 1))
                    if retry_after > 10:
                        print(f"{retry_after/60} minutes is too long! Giving up!")
                        self.hit_rate_limit = True
                        return None
                    print(f"Waiting {retry_after} seconds!")
                    time.sleep(retry_after)
                else:
                    break

        print("Max retries reached. Could not fetch track data.")
        return None

with DatabaseConnector(db_config) as conn:
    user = conn.get_user_from_user_DB(spotify_id='shaffeblasta')
login_token = user.login_token
access_token = login_token['access_token'] 
print(access_token)       
#url = f'https://api.spotify.com/v1/recommendations?seed_tracks=0c6xIDDpzE81m2q797ordA'
url = f'https://api.spotify.com/v1/track?id=0c6xIDDpzE81m2q797ordA'
headers = {
    'Authorization': f'Bearer {access_token}'
}

data = user.stats.get_data_info_with_retry(url, headers)