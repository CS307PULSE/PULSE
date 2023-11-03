export const parameterInfo = [
    {min: 0, max: 1, step: 0.01, name: 'Energy', key: 'target_energy'},
    {min: 0, max: 1, step: 0.01, name: 'Popularity', key: 'target_popularity'},
    {min: 0, max: 1, step: 0.01, name: 'Acousticness', key: 'target_acousticness'},
    {min: 0, max: 1, step: 0.01, name: 'Danceability', key: 'target_danceability'},
    {min: 0, max: 10, step: 0.1, name: 'Duration (min)', key: 'target_duration_min'},
    {min: 0, max: 1, step: 0.01, name: 'Instrumentalness', key: 'target_instrumentalness'},
    {min: 0, max: 1, step: 0.01, name: 'Liveness', key: 'target_liveness'},
    {min: -30, max: 0, step: 0.5, name: 'Loudness (dB)', key: 'target_loudness'},
    {min: 0, max: 1, step: 1, name: 'Mode', key: 'target_mode'},
    {min: 0, max: 1, step: 0.01, name: 'Speechiness', key: 'target_speechiness'},
    {min: 30, max: 300, step: 1, name: 'Tempo', key: 'target_tempo'},
    {min: 0, max: 1, step: 0.01, name: 'Valence', key: 'target_valence'}
];
export const presetEmotions = [
    {name: "Happy", parameters: [0.7,1,0.5,0.1,3,0.2,0,-5,1,0.5,120,1]},
    {name: "Sad", parameters:   [0.3,0.7,0.6,0.3,3,0.5,0,-5,0,0.5,80,0.3]},
    {name: "Angry", parameters: [0.5,0.7,0,0.5,3,0.2,0,-5,0,0.5,150,0.5]}
]
export const genreList = ["acoustic", "afrobeat", "alt-rock", "alternative", "ambient", "anime", "black-metal", "bluegrass", "blues", "bossanova", "brazil", "breakbeat", "british", "cantopop", "chicago-house", "children", "chill", "classical", "club", "comedy", "country", "dance", "dancehall", "death-metal", "deep-house", "detroit-techno", "disco", "disney", "drum-and-bass", "dub", "dubstep", "edm", "electro", "electronic", "emo", "folk", "forro", "french", "funk", "garage", "german", "gospel", "goth", "grindcore", "groove", "grunge", "guitar", "happy", "hard-rock", "hardcore", "hardstyle", "heavy-metal", "hip-hop", "holidays", "honky-tonk", "house", "idm", "indian", "indie", "indie-pop", "industrial", "iranian", "j-dance", "j-idol", "j-pop", "j-rock", "jazz", "k-pop", "kids", "latin", "latino", "malay", "mandopop", "metal", "metal-misc", "metalcore", "minimal-techno", "movies", "mpb", "new-age", "new-release", "opera", "pagode", "party", "philippines-opm", "piano", "pop", "pop-film", "post-dubstep", "power-pop", "progressive-house", "psych-rock", "punk", "punk-rock", "r-n-b", "rainy-day", "reggae", "reggaeton", "road-trip", "rock", "rock-n-roll", "rockabilly", "romance", "sad", "salsa", "samba", "sertanejo", "show-tunes", "singer-songwriter", "ska", "sleep", "songwriter", "soul", "soundtracks", "spanish", "study", "summer", "swedish", "synth-pop", "tango", "techno", "trance", "trip-hop", "turkish", "work-out", "world-music"];