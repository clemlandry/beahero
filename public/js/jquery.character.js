/*-----------------------------------------------
* mouseTrail
-------------------------------------------------*/
{
    var cursor = $(".cursor");
    var cWidth = 110;
    var delay = 10;
    let mouseX = 0;
    let mouseY = 0;
    let posX = 0;
    let posY = 0;
  
    TweenMax.to({}, .001, {
      repeat: -1,
  
      onRepeat: function () {
        posX += (mouseX - posX) / delay;
        posY += (mouseY - posY) / delay;
  
        TweenMax.set(cursor, {
          css: {
            left: posX - (cWidth / 2),
            top: posY - (cWidth / 2)
          }
        });
      }
    });
  
    if (!isSP) {
      $(document).on("mousemove", function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });
  
      // Cursor on
      $("a:not(.no-hov)").on({
        "mouseenter": function () {
          cursor.addClass("is-link");
        },
        "mouseleave": function () {
          cursor.removeClass("is-link");
        }
      });
    }
  }
/*-----------------------------------------------
 * YouTube API
-------------------------------------------------*/
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;

var ytID = [_default_ytid];
var ytNow = 0;
var ytSize = 'large';

function onYouTubeIframeAPIReady() {
	player = new YT.Player('js-chara-yt-autoplay', {
		height: '100%',
		width: '100%',
		videoId:ytID[0],
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange,
			'onError':onPlayerError
		},
		playerVars: {
			rel:0,
			controls:0,
			disablekb:1,
			fs:0,
			iv_load_policy:3,
			showinfo:0,
			modestbranding:1,
			playsinline : 1,
		}
	});
}
function onPlayerReady(event) {
	event.target.mute();
	event.target.playVideo();
}
function onPlayerStateChange(event) {
	if(event.data == YT.PlayerState.ENDED){
		ytNow++;
		if(ytNow >= ytID.length){
			ytNow = 0;
		}
		if(ytNow < 0){
			ytNow = ytID.length - 1;
		}
		player.clearVideo();
		player.loadVideoById(ytID[ytNow],0,ytSize);
		player.playVideo();
	}
}
function stopVideo() {
	player.stopVideo();
}
function onPlayerError(event){
	//console.log(event);
}

// YouTube Iframe 二重再生防止 [movie1つのみ]
$(".js-youtubePlay").on('click', function(){
	player.stopVideo();
	$(".js-modalBox").addClass('js-modalplayClose');
});
$(document).on('click','.js-modalplayClose a.js-modalClose', function(){
	player.playVideo();
	$(".modalBox").removeClass('js-modalplayClose');
});
$(document).on('click','.js-modalplayClose .js-oneModalIn', function(e) {
	player.playVideo();
	$(".modalBox").removeClass('js-modalplayClose');
});



/**
 * アスペクト比
 */
var $aspectWrap = $('.js-aspectWrap');
var aspect = 16 / 9;

function iframeSize() {
	$aspectWrap.each(function () {
		var $aspect = $(this).find('.js-aspect');
		var videoWrapWidth = window.innerWidth;
		var videoWrapHeight = window.innerHeight;
		var videoAspectWrap = videoWrapWidth / videoWrapHeight;
		// console.log(videoWrapWidth, videoWrapHeight);

		if (aspect <= videoAspectWrap) {
			$aspect.css({
				'width': videoWrapWidth + 'px',
				'height': videoWrapWidth / aspect + 'px'
			});
		} else {
			$aspect.css({
				'width': videoWrapHeight * aspect + 'px',
				'height': videoWrapHeight + 'px'
			});
		}
	});
}

// リサイズ処理
$(window).on('load resize', function(){
	iframeSize();
});

$('.p-charaChangeBtn').click(function(){
	if ($('.p-characterDetail').hasClass('c-change')) {
        $('.p-characterDetail').removeClass('c-change');
    } else {
        $('.p-characterDetail').addClass('c-change');
    }
});