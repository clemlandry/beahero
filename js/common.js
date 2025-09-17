var hs = location.hash;
var isSP = navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i);

/*-----------------------------------------------
 * COMMON
-------------------------------------------------*/
$(function () {
	// Anchor Smooth Scroll
		$('.js-anchor').on('click', function(){
		var speed = 1000;
		var href= $(this).attr("href");
		var target = $(href == "#" || href == "" ? 'html' : href);
		var position = target.offset().top;
		$('body,html').animate({scrollTop:position}, speed, 'easeOutQuart');
		return false;
	});
	// Anchor Smooth Scroll header
	$('.js-hanchor').on('click', function(){
		var speed = 1000;
		var href= $(this).attr("href");
		var target = $(href == "#" || href == "" ? 'html' : href);
		var headerHeight = $('.header__navBtnWrap').innerHeight();
		var position = target.offset().top - headerHeight;
		$('body,html').animate({scrollTop:position}, speed, 'easeOutQuart');
		return false;
	});

	// Menu
	$('.js-menu').on('click', function () {
		$(this).toggleClass('is-active');

		if ($(this).hasClass('is-active')) {
			$('.js-header').addClass('is-active');
			$("body").css({'overflow':'hidden'});
		} else {
			$('.js-header').removeClass('is-active');
			$("body").css({'overflow':''});
		}
	});
	$(".headerNavLists__item a").on('click',function(){
		$('.js-menu').removeClass('is-active');
		$('.js-header').removeClass('is-active');
		$("body").css({'overflow':''});
	});

	/**
	 * Modal open
	 */
	// Common
	$('.js-modalOpen').on('click', function () {
		let modalID = $(this).data('modal');
		$('#' + modalID).fadeIn(500);
		$('.modalBox').fadeIn(500);
		$('body').css({
			'overflow': 'hidden'
		});
	});

	// Youtube
	$('.js-youtubePlay').on('click', function () {
		var ytID = $(this).data('ytid');
		var ytURL = 'https://www.youtube.com/embed/' + ytID + '?autoplay=1&rel=0';
		setTimeout(function () {
			$('.js-youtubeIframe').attr('src', ytURL);
		}, 100);
	});
	// youtube thumbnail
	if ($('.js-youtubeThumb')[0]) {
		$('.js-youtubeThumb').each(function () {
			var ytID = $(this).data('ytid');
			$(this).css({ 'background-image': 'url(https://img.youtube.com/vi/' + ytID + '/maxresdefault.jpg)' })
		});
	}

	/**
	 * Modal close
	 * iframeのsrcをcloseの際に消す
	 */
	var $modalIF = $('.js-youtubeIframe');

	// Close処理
	function modalClose() {
		$('.modalBox, .oneModal').fadeOut(500);
		setTimeout(function () {
			$modalIF.attr('src', '');
		}, 500);
		$('body').css({
			'overflow': ''
		});
	}

	// Closeボタン
	$('.js-modalClose').on('click', function () {
		if($(".modalBox").attr('data-option') == 'etsModal'){
			setTimeout(function () {
				$modalIF.attr('src', '');
			}, 500);
			$("#youtubeModal").fadeOut(500);
			$("#etsModal_nice").fadeIn(500);
			$(".modalBox").attr('data-option','');
		}else{
			modalClose();
		}
	});

	// Close エリア外
	$('.js-oneModalIn').on('click touchend', function (e) {
		if (!$(e.target).closest('.js-oneModalIn__cont').length) {
			if($(".modalBox").attr('data-option') == 'etsModal'){
				setTimeout(function () {
					$modalIF.attr('src', '');
				}, 500);
				$("#youtubeModal").fadeOut(500);
				$("#etsModal_nice").fadeIn(500);
				$(".modalBox").attr('data-option','');
			}else{
				modalClose();
			}
		}
	});

	// アクセス時自動モーダル（#modal-auto-openを入れると自動で表示される）
	// if ($("#modal-auto-open")[0]) {
	//   $("#modal-auto-open").click()
	// }


	if (sessionStorage.getItem('theme')) {
		if (sessionStorage.getItem('theme') == '0') {
			$("body").addClass('red');
			$("body").removeClass('w');
			$("body").removeClass('vis3');
			$("body").removeClass('vis4');
			$("#themeColor").attr('content', '#ff211e');
			$(".js-pfswitch").removeClass("is-active");
			$(".switch_vis1").addClass("is-active");
		} 
		else if (sessionStorage.getItem('theme') == '1') {
			$("body").addClass('w');
			$("#themeColor").attr('content', '#fff');
			$("body").removeClass('vis3');
			$("body").removeClass('vis4');
			$(".js-pfswitch").removeClass("is-active");
			$(".switch_vis2").addClass("is-active");
		} else if (sessionStorage.getItem('theme') == 'vis3') {
			$("body").addClass('w');
			$("body").addClass('vis3');
			$("body").removeClass('vis4');
			$(".js-pfswitch").removeClass("is-active");
			$(".switch_vis3").addClass("is-active");
			$("#themeColor").attr('content', '#fff');
		} else if (sessionStorage.getItem('theme') == 'vis4') {
			$("body").addClass('w');
			$("body").removeClass('vis3');
			$("body").addClass('vis4');
			$(".js-pfswitch").removeClass("is-active");
			$(".switch_vis4").addClass("is-active");
			$("#themeColor").attr('content', '#fff');
		}else {
			$("body").addClass('w');
			$("body").addClass('vis4');
			$(".js-pfswitch").removeClass("is-active");
			$(".switch_vis4").addClass("is-active");
			$("#themeColor").attr('content', '#fff');
		}
	} else {
		$("body").addClass('w');
		$("body").addClass('vis4');
		$(".js-pfswitch").removeClass("is-active");
		$(".switch_vis4").addClass("is-active");
		$("#themeColor").attr('content', '#fff');
		sessionStorage.setItem('theme', "vis4");
	}
});

function movie(_ytid,_option){
	$('#youtubeModal').fadeIn(500);
	if(_option){
		$(".modalBox").attr('data-option',_option);
		if(_option == 'etsModal'){
			$("#etsModal_nice").fadeOut(500);
		}
	}else{
		$(".modalBox").attr('data-option','');
	}
	$('.modalBox').fadeIn(500);
	var ytURL = 'https://www.youtube.com/embed/'+_ytid+'?autoplay=1&rel=0';
	setTimeout(function(){
		$('.js-youtubeIframe').attr('src',ytURL);
	},100);
	$('body').css({'overflow':'hidden'});
}

/*-----------------------------------------------
 * IMAGE MODAL
-------------------------------------------------*/
function imgModal(_filename){
	$('#imgModal').fadeIn(500);
	$('.modalBox').fadeIn(500);
	$('body').css({'overflow':'hidden'});
	var imgSrc = _filename;
	$(".imgModalCont").html('<img src="'+imgSrc+'" onmousedown="return false" oncopy="return false" onselectstart="return false" oncontextmenu="return false">');
}

/*-----------------------------------------------
 * ScrollAnimation for IntersectionObserver [.js-scrani 要素が見えたら is-ani をaddclass するやつ]
-------------------------------------------------*/
const set_scrani = () => {
	const SCRANI_ACTIVE_CLASSNAME = 'is-ani';
	const scrani_callback = (entries) => {
		//各 entry（IntersectionObserverEntry オブジェクト）に対して
		entries.forEach((entry) => {
			//監視対象の要素が領域内に入った場合の処理
			if (entry.isIntersecting) {
				//監視対象の要素（entry.target）に is-ani クラスを追加
				entry.target.classList.add(SCRANI_ACTIVE_CLASSNAME);
			}
		});
	}
	const scrani_option = {
		rootMargin: '-30% 0px',
	}
	const scrani_observer = new IntersectionObserver(scrani_callback, scrani_option);

	const target_scrani = document.querySelectorAll('.js-scrani');
	//全ての監視対象要素を observe() メソッドに指定
	target_scrani.forEach((elem) => {
		//observe() に監視対象の要素を指定
		scrani_observer.observe(elem);
	});
}
setTimeout(function () {
	set_scrani();
}, 200);


$(".js-pfswitch").on('click', function () {
	$(".js-pfswitch").removeClass('is-active');
	$(this).addClass('is-active');
	var w = $(this).data('w');
	if (w == 1) {
		$("body").addClass('w');
		$("body").removeClass('red');
		$("body").removeClass('vis3');
		$("body").removeClass('vis4');
		sessionStorage.setItem('theme', "1");
		$("#themeColor").attr('content', '#fff');
	}else if (w == 'vis3') {
		$("body").removeClass('vis4');
		$("body").removeClass('red');
		$("body").addClass('w');
		$("body").addClass('vis3');
		sessionStorage.setItem('theme', "vis3");
		$("#themeColor").attr('content', '#fff');
	} else if (w == 'vis4') {
		$("body").removeClass('red');
		$("body").removeClass('vis3');
		$("body").addClass('w');
		$("body").addClass('vis4');
		sessionStorage.setItem('theme', "vis4");
		$("#themeColor").attr('content', '#fff');
	} else {
		//visual red
		$("body").addClass('red');
		$("body").removeClass('vis3');
		$("body").removeClass('w');
		$("body").removeClass('vis4');
		sessionStorage.setItem('theme', "0");
		$("#themeColor").attr('content', '#ff211e');
	}
});
$(".p-character__item a").on({
	"mouseenter": function () {
	  // console.log("mouseenter");
	  $("body").addClass("is-hover");
	},
	"mouseleave": function () {
	  $("body").removeClass("is-hover");
	}
  });

$(document).ready(function() {
	var firstOther = $('.otherCharaNavBtn').first();
    firstOther.addClass('is-active');
    var firstTarget = firstOther.data('other');
    $('.otherCharaCont').removeClass('is-active');
    $('.otherCharaCont[data-other="' + firstTarget + '"]').addClass('is-active');

	$('.otherCharaNavBtn').on('click', function() {
		var otherTarget = $(this).data('other');

		$('.otherCharaCont').removeClass('is-active');
		$('.otherCharaCont[data-other="' + otherTarget + '"]').addClass('is-active');

		$('.otherCharaNavBtn').removeClass('is-active');
		$(this).addClass('is-active');
	});
});