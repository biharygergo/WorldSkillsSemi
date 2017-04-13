function PuzzleGame(diff) {
  var game = [];
  var difficulty = diff;

  game.dropped = "";
  game.droppedCount = 0;
  game.imageDimensions = Math.floor(498.0 / difficulty);

  game.prepareGame = function () {
    var image = new Image();
    var pieces = [];
    image.onload = function () {
      pieces = game.cutImageUp(image);
      game.insertDivs(pieces);
    };
    image.src = 'images/tulip.jpg';

  };

  game.checkWin = function () {
    if (game.droppedCount == difficulty * difficulty) {
      $("#dialog-finished").dialog("open");
    }
  };

  game.setDestinationDivs = function (shuffledIndexes, pieces) {
    var imgCount = 0;
    for (i = 0; i < difficulty; i++) {
      var row = $("<div class='puzzleRow'></div>");
      $("#rightDiv").append(row);
      for (j = 0; j < difficulty; j++) {
        var tileId = shuffledIndexes[imgCount];
        row.append("<div id='destination" + imgCount + "' class='tileSizeLevel" + difficulty + "'> <img src='" + pieces[imgCount] + "' id='destimg" + tileId + "' class='backgroundImage' /> </div>");
        var tilename = "#tile" + imgCount;
        var destinationName = "#destination" + imgCount;
        $(destinationName).droppable({
          accept: tilename,
          tolerance: 'fit',
          drop: function () {
            game.droppedCount++;
            game.checkWin();
            var id = $(this).attr('id').substring(11);
            game.dropped = "tile" + id;
          }
        });
        imgCount++;

      }
    }
  };

  game.setSourceDivs = function (shuffledIndexes, pieces) {
    var imgCount = 0;
    for (i = 0; i < difficulty; i++) {
      var sourceRow = $("<div class='puzzleRow'></div>");
      $("#leftDiv").append(sourceRow);


      for (j = 0; j < difficulty; j++) {
        var tileId = shuffledIndexes[imgCount];

        sourceRow.append("<div id='tile" + tileId + "' class='tileSizeLevel" + difficulty + "'> <img src='" + pieces[shuffledIndexes[imgCount]] + "' id='img" + i + j + "' /> </div>");

        var tilename = "#tile" + tileId;
        var destinationName = "#destination" + tileId;

        $(tilename).draggable({
          revert: 'invalid',
          snap: destinationName,
          start: function () {
            $(this).addClass("dragging");
          },
          stop: function () {
            var id = $(this).attr('id').substring(4);
            $(this).removeClass("dragging");
            if (game.dropped === $(this).attr('id')) {
              $(this).addClass("hidden");
              var destImage = "#destimg" + shuffledIndexes[id];
              $(destImage).addClass("opaqueAnimation");

            }

          }
        });
        imgCount++;

      }

    }
  };

  game.insertDivs = function (pieces) {
    var imgCount = 0;
    var shuffledIndexes = [];
    for (c = 0; c < difficulty * difficulty; c++) {
      shuffledIndexes.push(c);
    }
    game.shuffle(shuffledIndexes);

    //Set up destination divs
    game.setDestinationDivs(shuffledIndexes,pieces);
    game.setSourceDivs(shuffledIndexes,pieces);

  };

  game.shuffle = function (array) {
    var j, x, i;
    for (i = array.length; i; i--) {
      j = Math.floor(Math.random() * i);
      x = array[i - 1];
      array[i - 1] = array[j];
      array[j] = x;
    }
  };


  game.cutImageUp = function (image) {

    var imagePieces = [];
    var picSideLength = 498.0 / difficulty;
    for (var x = 0.0; x < difficulty; ++x) {
      for (var y = 0.0; y < difficulty; ++y) {
        var canvas = document.createElement('canvas');
        canvas.width = picSideLength;
        canvas.height = picSideLength;
        var context = canvas.getContext('2d');
        context.drawImage(image, x * picSideLength, y * picSideLength, picSideLength, picSideLength, 0, 0, canvas.width, canvas.height);
        imagePieces.push(canvas.toDataURL());
      }
    }

    return imagePieces;
  };



  return game;
}

$(function () {
    var startDialog, finishedDialog, form,

      name = $("#userName"),
      timer = $("#timer"),
      elapsedSeconds = 0,
      difficultySelector = $("#difficultySelector"),
      pauseButton = $("#pauseButton"),
      restartButton = $("#restartButton"),
      selectedDifficulty = 2,
      stopwatch = null,
      isPaused = false,
      errorLabel = $("#errorLabel");



    function submitPlayer() {
      var valid = true;

      if (name.val().length === 0) {
        valid = false;
        name.addClass("ui-state-error");
        errorLabel.removeClass("hidden");
        errorLabel.append("You must specify a name to play the game!");

      }
      if (valid) {
        name.removeClass("ui-state-error");
        errorLabel.addClass("hidden");
        errorLabel.empty();
        $("#playerName").append(name.val());
        var game = new PuzzleGame(selectedDifficulty);
        game.prepareGame();
        startDialog.dialog("close");
        startStopWatch();

      }
      return valid;
    }

    var startStopWatch = function () {
      stopwatch = setInterval(function () {
        elapsedSeconds++;
        var minutes = Math.floor(elapsedSeconds / 60);
        var seconds = elapsedSeconds - minutes * 60;

        timer.empty();
        timer.append(addLeadingZeros(minutes, 2) + ":" + addLeadingZeros(seconds, 2));

      }, 1000);
    };
    startDialog = $("#dialog-form").dialog({
      autoOpen: false,
      height: 400,
      width: 800,
      modal: true,
      buttons: {
        "Start": submitPlayer

      },
      show: {
        effect: "fade",
        duration: 1000
      },
      hide: {
        effect: "fade",
        duration: 1000
      },
      close: function () {
        form[0].reset();
      }
    });

    finishedDialog = $("#dialog-finished").dialog({
      autoOpen: false,
      modal: true,
      width: 600,

      show: {
        effect: "fade",
        duration: 1000
      },
      hide: {
        effect: "fade",
        duration: 1000
      },
      open: function () {
        clearInterval(stopwatch);
      },
      buttons: {
        "Restart application": function () {
          $(this).dialog("close");
          restartApplication();

        }
      }
    });


    function addLeadingZeros(string, length) {
      return (new Array(length + 1).join('0') + string).slice(-length);
    }

    restartApplication = function () {
      $("#leftDiv").empty();
      $("#rightDiv").empty();
      $("#playerName").text("");
      clearInterval(stopwatch);
      elapsedSeconds = 0;
      timer.empty();
      timer.append("00:00");
      startDialog.dialog("open");
    };

    form = startDialog.find("form").on("submit", function (event) {
      event.preventDefault();
      submitPlayer();
    });

    restartButton.click(function () {
      restartApplication();

    });

    pauseButton.click(function () {
      if (!isPaused) {
        clearInterval(stopwatch);
        $("#leftDiv").addClass("hidden");
        $("#rightDiv").addClass("hidden");
        pauseButton.empty();
        pauseButton.append("Resume");

      }
      else {
        startStopWatch();
        $("#leftDiv").removeClass("hidden");
        $("#rightDiv").removeClass("hidden");
        pauseButton.empty();
        pauseButton.append("Pause");
      }
      isPaused = !isPaused;

    });

    startDialog.dialog("open");
    difficultySelector.selectmenu({
      change: function (event, data) {
        selectedDifficulty = data.item.value;
      }
    });

  }
);