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