


function runView(){

    function createTable(){
        var tableHtml = `
<table class="table table-video" id="videos">
    <thead>
        <tr>
            <th> Date </th>
            <th> Player </th>
            <th> Character </th>
            <th> Player </th>
            <th> Character </th>
        </tr>
    </thead>
    <tbody id="videos">
    </tbody>
</table>`;
        $('#output').html(tableHtml);
        $('.table-video').each(function (){
            $(this).DataTable({
                "paging": false,
                "ordering": true,
                "info": false,
                "bFilter": false,
                "columnDefs": [
                    // { "orderable": false, "targets": 0 }
                ],
                "order": [[0, 'desc']],
            });
        });
    }

    function setUrlParams(game, player, char1, char2){
        var params = "?game=" + game;
        if (player){
            params += "&player=" + player;
        }
        if (char1){
            params += "&char1=" + char1;
        }
        if (char2){
            params += "&char2=" + char2;
        }
        window.history.pushState({}, "", params);
    }

    function readUrlParams(manager){
        var game = TOOL.readUrlParam("game");
        if (game && manager.hasGame(game)){
            $('#game').val(game).prop('selected', true);
            var player = TOOL.readUrlParam("player");
            var char1 = TOOL.readUrlParam("char1");
            var char2 = TOOL.readUrlParam("char2");

            printResults(manager);
            if (player && manager.hasPlayer(game, player)){
                $('#player').val(player).prop('selected', true);
            }
            if (char1 && manager.hasCharacter(game, char1)){
                $('#char1').val(char1).prop('selected', true);
            }
            if (char2 && manager.hasCharacter(game, char2)){
                $('#char2').val(char2).prop('selected', true);
            }
        }
        printResults(manager);
    }

    function printResults(manager){
        var game = $('#game').val();

        if (manager.currentGame != game){
            manager.currentGame = game;
            var base_select = '<option value="">-</option>';
            var html_char1 = base_select;
            var html_char2 = base_select;
            var html_player = base_select;
            manager.getCharacters(game).forEach(function (char){
                html_char1 += TOOL.option(char);
                html_char2 += TOOL.option(char);
            });
            manager.getPlayers(game).forEach(function (player){
                html_player += TOOL.option(player);
            });
            $('#char1').html(html_char1);
            $('#char2').html(html_char2);
            $('#player').html(html_player);
        }

        var player = $('#player').val();
        var char1 = $('#char1').val();
        var char2 = $('#char2').val();
        setUrlParams(game, player, char1, char2);

        var videos = manager.getVideos(game, player, char1, char2);
        var out = $('#videos').DataTable()
        out.clear();
        videos.forEach(function (video){
            out.row.add(video.toData());
        });
        out.draw();
    }

    function onLoad(parsedVideos){
        var manager = Manager();
        parsedVideos.forEach(function (video){
            manager.manageVideo(video);
        });

        // setup display
        var html_game = "";
        manager.getGames().forEach(function (game){
            html_game += '<option value="' + game + '">' + game + '</option>';
        });
        $('#game').html(html_game);
        $('#game').val('SF5').prop('selected', true);

        // setup triggers
        $('.filter').change(function (){
            printResults(manager);
        });
        $('.reset').click(function (){
            var select_id = $(this).data('id');
            $('#' + select_id).val('').prop('selected', true);
            $('#' + select_id).trigger('change');
        });

        readUrlParams(manager);
    }

    function setup(){
        createTable();
        var store = Store();
        store.load(onLoad);
    }

    setup();
}
