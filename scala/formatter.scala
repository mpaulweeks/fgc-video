
package fgc.formatter

import fgc.scraper.VideoItem
import fgc.scraper.YouTubeChannel

import java.io._
import scala.util.matching.Regex

import scalaj.http._
import org.json4s._
import org.json4s.native.Serialization

case class VideoData(
    id: String,
    timestamp: String,
    game: String,
    players: List[String],
    characters: List[List[String]]
){
    val tuple: List[Any] = List(
        timestamp, id, game, players, characters
    )
}

trait Parser {
    val channel: YouTubeChannel
    def parseVideo(videoItem: VideoItem): Option[VideoData]
    def loadVideos(): List[VideoData] = {
        channel.loadFile.values.flatMap(parseVideo).toList
    }

    val rPlayer = "([\\w\\.\\-\\| ]+) "
    val rCharacter = "(?:\\(|\\[) *([\\w\\. ]+) *(?:\\)|\\]) "
    val rVersus = "(?:Vs|vs)\\.? "
    val rGameMap: Map[String, String]

    def fixGame(rawGame: String): String = {
        // todo improve this
        var matchingKey = ""
        rGameMap.foreach { case (key, value) =>
            val matchMaybe = value.r.findFirstIn(rawGame)
            matchMaybe match {
                case Some(name) =>
                    matchingKey = key
                case None =>
                    // do nothing
            }
        }
        matchingKey
    }
    def fixCharacters(char1: String, char2: String): List[List[String]] = {
        List(List(char1), List(char2))
    }
    def fixPlayers(player1: String, player2: String): List[String] = {
        List(player1, player2)
    }
}

object YogaFlameParser extends Parser {
    val channel = YouTubeChannel.YogaFlame

    val rGameMap = Map(
        "SF5" -> "SF5|SFV|Beta SFV",
        "USF4" -> "USF4",
        "SSF4AE2012" -> "(?:Arcade Edition|AE)(?: Version)? +2012",
        "SSF4AE" -> "Arcade Edition|AE",
        "SF3" -> "SF3",
        "SFxT" -> "SFxT",
        "TTT2" -> "Tekken Tag Tournament 2"
    )
    val regex: Regex = {
        val rRounds = "(?:X[0-9] )?"
        val rResolution = " *(?:1080p|720p)"
        val rGames = rGameMap.values.mkString("|")
        val rGame = s" *($rGames) "
        (
            rRounds +
            rPlayer +
            rCharacter +
            rVersus +
            rPlayer +
            rCharacter +
            rGame +
            rResolution
        ).r
    }

    def parseVideo(videoItem: VideoItem): Option[VideoData] = {
        val matchMaybe = regex.findFirstMatchIn(videoItem.title)
        matchMaybe match {
            case Some(matchRes) => {
                val matches = matchRes.subgroups
                Option(new VideoData(
                    videoItem.id,
                    videoItem.timestamp,
                    fixGame(matches(4)),
                    fixPlayers(matches(0), matches(2)),
                    fixCharacters(matches(1), matches(3))
                ))
            }
            case None => {
                // failed regex, maybe log?
                None
            }
        }
    }
}

object VideoManager {
    private val DATA_FILE_PATH = "data/video.json"
    private val parsers = List(
        YogaFlameParser
    )

    def toFile(videoDatas: List[VideoData]): String = {
        val sortedVideos = (
            videoDatas
            .sortBy(r => (r.timestamp, r.id)).reverse
            .map(_.tuple)
        )
        implicit val formats = Serialization.formats(NoTypeHints)
        val serialized = Serialization.writePretty(sortedVideos)
        val file = new File(DATA_FILE_PATH)
        val bw = new BufferedWriter(new FileWriter(file))
        bw.write(serialized)
        bw.close
        serialized
    }

    def loadVideos(): List[VideoData] = {
        parsers.map(p => p.loadVideos).flatten
    }

    def formatVideos(rawVideos: List[VideoData]): List[VideoData] = {
        // todo player/character normalization
        rawVideos
    }
}

object Formatter {
    def run(): Boolean = {
        val videos = VideoManager.loadVideos
        val formatted = VideoManager.formatVideos(videos)
        VideoManager.toFile(formatted)
        true
    }

    def main(args: Array[String]) {
        println("running formatter")
        println(run)
    }
}