from enum import Enum

class GameType(Enum):
    GUESS_WHO_LISTENS_TO_SONG = 0
    GUESS_NEXT_LYRICS = 1

class Game:
    def __init__(self,
                 num_rounds=5,
                 num_players=1,
                 player_scores=None,
                 game_type=GameType.GUESS_WHO_LISTENS_TO_SONG):
        self.num_rounds = num_rounds
        self.num_players=num_players
        self.player_scores = player_scores if player_scores is not None else [[0] * num_players for i in range(num_rounds)]
        self.game_type = game_type

    def save_settings(self):
        # Get settings from UI and save to fields
        return
    
    def play_round(self, round):
        # Play round
        # Update scores with self.player_scores[round][playerNum] += score for playerNum for the round
        if self.game_type == GameType.GUESS_WHO_LISTENS_TO_SONG:
            return
        elif self.game_type == GameType.GUESS_NEXT_LYRICS:
            #functionality for this game
            return
    
    def play_game(self):
        round = 0
        while round < self.num_rounds:
            self.play_round(round)
            round+=1

        # Do things to finish off the game including scoring and displaying scores