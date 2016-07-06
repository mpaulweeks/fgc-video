
var GAME_SF5 = "SF5";
var GAME_SF4 = "SF4";

function fixGame(game){
    if (!game || game == "SFV"){
        game = GAME_SF5;
    }
    return game;
}

function fixCharacters(char1, char2){
    if (char1 == char2){
        return [char1];
    }
    return [char1, char2];
}

function fixPlayers(player1, player2){
    return [player1, player2];
}

/*
(X[0-9] )?[\w\.]+ \( [\w\.]+ \) Vs [\w\.]+ \( [\w\.]+ \) (SF5|SFV|SF4) (1080p|720p)
(X[0-9] )?[\w\.\- ]+ \( [\w\. ]+ \) Vs [\w\.\- ]+ \( [\w\. ]+ \) (SF5|SFV|SF4) (1080p|720p) - 60fps
(X[0-9] )?([\w\.\- ]+) \( ([\w\. ]+) \) Vs ([\w\.\- ]+) \( ([\w\. ]+) \) (SF5|SFV|SF4) 1080p|720p - 60fps
(X[0-9] )?([\w\.\- ]+) \( ([\w\. ]+) \) Vs ([\w\.\- ]+) \( ([\w\. ]+) \) ((SF5|SFV|SF4) )?1080p|720p - 60fps
*/
var REGEX_YOGAFLAME = /(X[0-9] )?([\w\.\- ]+) \( ([\w\. ]+) \) Vs ([\w\.\- ]+) \( ([\w\. ]+) \) ((SF5|SFV|USF4|Arcade Edition 2012|Arcade Edition|SF3|) )?1080p|720p - 60fps/;

function parseYogaFlame(dataTuple){
    var timestamp = dataTuple[0];
    var id = dataTuple[1];
    var title = dataTuple[2];
    var res = REGEX_YOGAFLAME.exec(title);
    if (!res){
        // TOOL.log(title);
        return null;
    }
    return Video(
        timestamp,
        id,
        title,
        fixGame(res[7]),
        fixCharacters(res[3], res[5]),
        fixPlayers(res[2], res[4])
    );
}

function parseJSON(data, parser){
    var res = [];
    data.forEach(function (dataTuple){
        var video = parser(dataTuple);
        if (video){
            res.push(video);
        }
    });
    return res;
}
