/*******************************************************************************
 jquery.mb.components
 Copyright (c) 2001-2010. Matteo Bicocchi (Pupunzi); Open lab srl, Firenze - Italy
 email: mbicocchi@open-lab.com
 site: http://pupunzi.com

 Licences: MIT, GPL
 http://www.opensource.org/licenses/mit-license.php
 http://www.gnu.org/licenses/gpl.html
 ******************************************************************************/

/*
 * Name:jquery.mb.extruder
 * Version: 2.3
 * dependencies: jquery.metadata.js, jquery.mb.flipText.js, jquery.hoverintent.js
 */


(function($) {
	document.extruder=new Object();
	document.extruder.left = 0;
	document.extruder.top = 0;
	document.extruder.bottom = 0;
	document.extruder.right = 0;
	document.extruder.idx=0;
	var isIE=$.browser.msie;

	$.mbExtruder= {
		author:"Matteo Bicocchi",
		version:"2.3",
		defaults:{
			width:350,
			positionFixed:true,
			sensibility:800,
			position:"top",
			accordionPanels:true,
			top:"auto",
			extruderOpacity:1,
			flapMargin:35,
			textOrientation:"bt", // or "tb" (top-bottom or bottom-top)
			onExtOpen:function(){},
			onExtContentLoad:function(){},
			onExtClose:function(){},
			hidePanelsOnClose:true,
			closeOnExternalClick:true,
			autoCloseTime:0,
			autoOpenTime:0,
			slideTimer:300
		},

		buildMbExtruder: function(options){
			return this.each (function (){
				this.options = {};
				$.extend (this.options, $.mbExtruder.defaults);
				$.extend (this.options, options);
				this.idx=document.extruder.idx;
				document.extruder.idx++;
				var extruder,extruderContent,wrapper,extruderStyle,wrapperStyle,txt,closeTimer,openTimer;
				extruder= $(this);
				extruderContent=extruder.html();

				extruder.css("zIndex",100);

				var isVertical = this.options.position=="left" || this.options.position=="right";

				var extW= isVertical?1: this.options.width;

				var c= $("<div/>").addClass("content").css({overflow:"hidden", width:extW});
				c.append(extruderContent);
				extruder.html(c);

				var position=this.options.positionFixed?"fixed":"absolute";
				extruder.addClass("extruder");
				extruder.addClass(this.options.position);
				var isHorizontal = this.options.position=="top" || this.options.position=="bottom";
				extruderStyle=
						this.options.position=="top"?
						{position:position,top:0,left:"50%",marginLeft:-this.options.width/2,width:this.options.width}:
								this.options.position=="bottom"?
								{position:position,bottom:0,left:"50%",marginLeft:-this.options.width/2,width:this.options.width}:
										this.options.position=="left"?
										{position:position,top:0,left:0,width:1}:
										{position:position,top:0,right:0,width:1};
				extruder.css(extruderStyle);
				if(!isIE) extruder.css({opacity:this.options.extruderOpacity});
				extruder.wrapInner("<div class='ext_wrapper'></div>");
				wrapper= extruder.find(".ext_wrapper");

				wrapperStyle={position:"absolute", width:isVertical?1:this.options.width};
				wrapper.css(wrapperStyle);


				if (isHorizontal){
					this.options.position=="top"?document.extruder.top++:document.extruder.bottom++;
					if (document.extruder.top>1 || document.extruder.bottom>1){
						alert("more than 1 mb.extruder on top or bottom is not supported jet... hope soon!");
						return;
					}
				}

				if ($.metadata){
					$.metadata.setType("class");
					if (extruder.metadata().title) extruder.attr("extTitle",extruder.metadata().title);
					if (extruder.metadata().url) extruder.attr("extUrl",extruder.metadata().url);
					if (extruder.metadata().data) extruder.attr("extData",extruder.metadata().data);
					if (extruder.metadata().htmlCallback) extruder.attr("extHtmlCallback",extruder.metadata().htmlCallback);
					if (extruder.metadata().htmlText) extruder.attr("extHtmlText",extruder.metadata().htmlText);
				}
				var flapFooter=$("<div class='footer'/>");
				var flap=$("<div class='flap'><span class='flapLabel'/></div>");
				if (document.extruder.bottom){
					wrapper.prepend(flapFooter);
					wrapper.prepend(flap);
				}else{
					wrapper.append(flapFooter);
					wrapper.append(flap);
				}

				txt=extruder.attr("extTitle")?extruder.attr("extTitle"): "";
				var flapLabel = extruder.find(".flapLabel");
				flapLabel.text(txt);
				if(isVertical){
					flapLabel.html(txt).css({whiteSpace:"noWrap"});//,height:this.options.flapDim
					var orientation= this.options.textOrientation == "tb";
					var labelH=extruder.find('.flapLabel').getFlipTextDim()[1];
					extruder.find('.flapLabel').mbFlipText(orientation);
				}else{
					flapLabel.html(txt).css({whiteSpace:"noWrap"});
				}

				if (extruder.attr("extUrl") || extruder.attr("extHtmlCallback") || extruder.attr("extHtmlText")){
					extruder.setMbExtruderContent({
						url:extruder.attr("extUrl"),
						htmlCallback:extruder.attr("extHtmlCallback"),
						htmlText:extruder.attr("extHtmlText"),
						data:extruder.attr("extData"),
						callback: function(){
							if (extruder.get(0).options.onExtContentLoad) extruder.get(0).options.onExtContentLoad();
						}
					})
				}else{
					var container=$("<div>").addClass("text").css({width:extruder.get(0).options.width-20, height:extruder.height()-20, overflowY:"auto"});
					c.wrapInner(container);
					extruder.setExtruderVoicesAction();
				}

				flap.bind("click",function(){
					if (!extruder.attr("isOpened")){
						extruder.openMbExtruder();
					}else{
						extruder.closeMbExtruder();
						extruder.removeAttr("isOpened");
					}
				}).bind("mouseenter",function(){
					if(extruder.get(0).options.autoOpenTime>0){
						openTimer=setTimeout(function(){
							extruder.openMbExtruder();
							$(document).one("click.extruder"+extruder.get(0).idx,function(){extruder.closeMbExtruder();});
						},extruder.get(0).options.autoOpenTime);
					}
				}).bind("mouseleave",function(){
					clearTimeout(openTimer);
				});

				c.bind("mouseleave", function(e){
					if(extruder.get(0).options.closeOnExternalClick){

						//Chrome bug: FORMELEMENT fire mouseleave event.
						if(!$(e.target).parents().is(".text"))
							$(document).one("click.extruder"+extruder.get(0).idx,function(){extruder.closeMbExtruder();});
					}
					closeTimer=setTimeout(function(){

						if(extruder.get(0).options.autoCloseTime > 0){
							extruder.closeMbExtruder();
						}
					},extruder.get(0).options.autoCloseTime);
				}).bind("mouseenter", function(){
					clearTimeout(closeTimer);
					$(document).unbind("click.extruder"+extruder.get(0).idx);
				});

				if (isVertical){
					c.css({ height:"100%"});
					if(this.options.top=="auto") {
						flap.css({top:100+(this.options.position=="left"?document.extruder.left:document.extruder.right)});
						this.options.position=="left"?document.extruder.left+=labelH+this.options.flapMargin:document.extruder.right+= labelH+this.options.flapMargin;
					}else{
						flap.css({top:this.options.top});
					}
					var clicDiv=$("<div/>").css({position:"absolute",top:0,left:0,width:"100%",height:"100%",background:"transparent"});
					flap.append(clicDiv);
				}
			});
		},

		setMbExtruderContent: function(options){
			var htmlSource = false;
			this.options = {
				url:false,
				data:"",
				callback:function(){},
				htmlCallback:false,
				htmlText:false,
			};
			$.extend (this.options, options);
			if (this.options.url && this.options.url.length > 0) {
				htmlSource = 'url';
			} else if (this.options.htmlCallback && this.options.htmlCallback.length > 0 && typeof window[this.options.htmlCallback] == 'function' ) {
				htmlSource = 'callback';
			} else if (this.options.htmlText && this.options.htmlText.length > 0) {
				htmlSource = 'text';
			}

			if (!htmlSource) {
				alert("internal error: no URL, callback or text to use for content");
				return;
			}
			var url=this.options.url;
			var data=this.options.data;
			var where=$(this), voice;
			var cb= this.options.callback;
			var container=$("<div>").addClass("container");
			if (!($.browser.msie && $.browser.version<=7))
				container.css({width:$(this).get(0).options.width});
			where.find(".content").wrapInner(container);
			var successFunction = function(html){
				where.find(".container").append(html);
				voice=where.find(".voice");
				voice.hover(function(){$(this).addClass("hover");},function(){$(this).removeClass("hover");});
				where.setExtruderVoicesAction();
				if (cb) {
					setTimeout(function(){cb();},100);
				}
			};
			if (htmlSource == 'url') {
				$.ajax({
					type: "POST",
					url: url,
					data: data,
					async:false,
					dataType:"html",
					success: function(html) {successFunction(html);}
				});
			} else if (htmlSource == 'callback') {
				successFunction(window[this.options.htmlCallback](data));
			} else if (htmlSource == 'text') {
				successFunction(unescape(this.options.htmlText));
			}
		},

		openMbExtruder:function(c){
			var extruder= $(this);
			extruder.attr("isOpened",true);
			$(document).unbind("click.extruder"+extruder.get(0).idx);
			var opt= extruder.get(0).options;
			extruder.addClass("isOpened");
			if(!isIE) extruder.css("opacity",1);
			var position= opt.position;
			extruder.mb_bringToFront();
			if (position=="top" || position=="bottom"){
				extruder.find('.content').slideDown( opt.slideTimer);
				if(opt.onExtOpen) opt.onExtOpen();
			}else{

				if(!isIE) $(this).css("opacity",1);
				extruder.find('.ext_wrapper').css({width:""});
				extruder.find('.content').css({overflowX:"hidden", display:"block"});
				extruder.find('.content').animate({ width: opt.width}, opt.slideTimer);
				if(opt.onExtOpen) opt.onExtOpen();
			}
			if (c) {
				setTimeout(function(){
					$(document).one("click.extruder"+extruder.get(0).idx,function(){extruder.closeMbExtruder();});
				},100);
			}
		},

		closeMbExtruder:function(){
			var extruder= $(this);
			extruder.removeAttr("isOpened");
			var opt= extruder.get(0).options;
			extruder.removeClass("isOpened");
			$(document).unbind("click.extruder"+extruder.get(0).idx);
			if(!isIE) extruder.css("opacity",opt.extruderOpacity);
			if(opt.hidePanelsOnClose) extruder.hidePanelsOnClose();
			if (opt.position=="top" || opt.position=="bottom"){
				extruder.find('.content').slideUp(opt.slideTimer);
				if(opt.onExtClose) opt.onExtClose();
			}else if (opt.position=="left" || opt.position=="right"){
				extruder.find('.content').css({overflow:"hidden"});
				extruder.find('.content').animate({ width: 1 }, opt.slideTimer,function(){
					extruder.find('.ext_wrapper').css({width:1});
					extruder.find('.content').css({overflow:"hidden",display:"none"});
					if(opt.onExtClose) opt.onExtClose();
				});
			}
		}
	};

	jQuery.fn.mb_bringToFront= function(){
		var zi=10;
		$('*').each(function() {
			if($(this).css("position")=="absolute" ||$(this).css("position")=="fixed"){
				var cur = parseInt($(this).css('zIndex'));
				zi = cur > zi ? parseInt($(this).css('zIndex')) : zi;
			}
		});
		$(this).css('zIndex',zi+=1);
		return zi;
	};

	/*
	 * EXTRUDER CONTENT
	 */

	$.fn.setExtruderVoicesAction=function(){
		var extruder=$(this);
		var opt=extruder.get(0).options;
		var voices= $(this).find(".voice");
		voices.each(function(){
			var htmlSource = false;
			var voice=$(this);
			if ($.metadata){
				$.metadata.setType("class");
				if (voice.metadata().panel) voice.attr("panel",voice.metadata().panel);
				if (voice.metadata().htmlCallback) voice.attr("htmlCallback",voice.metadata().htmlCallback);
				if (voice.metadata().htmlText) voice.attr("htmlText",voice.metadata().htmlText);
				if (voice.metadata().data) voice.attr("data",voice.metadata().data);
				if (voice.metadata().disabled) voice.attr("setDisabled", voice.metadata().disabled);
			}

			if (voice.attr("setDisabled"))
				voice.disableExtruderVoice();

				if (voice.attr("panel") && voice.attr("panel").length > 0) {
					htmlSource = 'panel';
				} else if (voice.attr("htmlCallback") && voice.attr("htmlCallback").length > 0 && typeof window[voice.attr("htmlCallback")] == 'function' ) {
					htmlSource = 'callback';
				} else if (voice.attr("htmlText") && voice.attr("htmlText").length > 0) {
					htmlSource = 'text';
				}

				if (htmlSource){
				voice.append("<span class='settingsBtn'/>");
				voice.find(".settingsBtn").css({opacity:.5});
				voice.find(".settingsBtn").hover(
						function(){
							$(this).css({opacity:1});
						},
						function(){
							$(this).not(".sel").css({opacity:.5});
						}).click(function(){
					if ($(this).parents().hasClass("sel")){
						if(opt.accordionPanels)
							extruder.hidePanelsOnClose();
						else
							$(this).closePanel();
						return;
					}

					if(opt.accordionPanels){
						extruder.find(".optionsPanel").slideUp(400,function(){$(this).remove();});
						voices.removeClass("sel");
						voices.find(".settingsBtn").removeClass("sel").css({opacity:.5});
					}
					var content=$("<div class='optionsPanel'></div>");
					voice.after(content);
					var successFunction = function(html){
						var c= $(html);
						content.html(c);
						content.children().not(".text")
								.addClass("panelVoice")
								.click(function(){
							extruder.closeMbExtruder();
						});
						content.slideDown(400);
					}
					if (htmlSource == 'panel') {
						$.ajax({
							type: "POST",
							url: voice.attr("panel"),
							data: voice.attr("data"),
							async:false,
							dataType:"html",
							success: function(html) {successFunction(html);}
						});
					} else if (htmlSource == 'callback') {
						successFunction(window[voice.attr("htmlCallback")](voice.attr("data")));
					} else if (htmlSource == 'text') {
						successFunction(unescape(voice.attr("htmlText")));
					}

					voice.addClass("sel");
					voice.find(".settingsBtn").addClass("sel").css({opacity:1});
				});
			}

			if (voice.find("a").length==0 && voice.attr("panel")){
				voice.find(".label").not(".disabled").css("cursor","pointer").click(function(){
					voice.find(".settingsBtn").click();
				});
			}

			if ((!voice.attr("panel") ||voice.attr("panel")=="false" ) && (!voice.attr("setDisabled") || voice.attr("setDisabled")!="true")){
				voice.find(".label").click(function(){
					extruder.hidePanelsOnClose();
					extruder.closeMbExtruder();
				});
			}
		});
	};

	$.fn.disableExtruderVoice=function(){
		var voice=$(this);
		var label = voice.find(".label");
		voice.removeClass("sel");
		voice.next(".optionsPanel").slideUp(400,function(){$(this).remove();});
		voice.attr("setDisabled",true);
		label.css("opacity",.4);
		voice.hover(function(){$(this).removeClass("hover");},function(){$(this).removeClass("hover");});
		label.addClass("disabled").css("cursor","default");
		voice.find(".settingsBtn").hide();
		voice.bind("click",function(event){
			event.stopPropagation();
			return false;
		});
	};

	$.fn.enableExtruderVoice=function(){
		var voice=$(this);
		voice.attr("setDisabled",false);
		voice.find(".label").css("opacity",1);
		voice.find(".label").removeClass("disabled").css("cursor","pointer");
		voice.unbind("click");
		voice.find(".settingsBtn").show();
	};

	$.fn.hidePanelsOnClose=function(){
		var voices= $(this).find(".voice");
		$(this).find(".optionsPanel").slideUp(400,function(){$(this).remove();});
		voices.removeClass("sel");
		voices.find(".settingsBtn").removeClass("sel").css("opacity",.5);
	};

	$.fn.openPanel=function(){
		var voice=$(this).hasClass("voice") ? $(this) : $(this).find(".voice");
		voice.each(function(){
			if($(this).hasClass("sel")) return;
			$(this).find(".settingsBtn").click();
		})
	};

	$.fn.closePanel=function(){
		var voice=$(this).hasClass("voice") ? $(this) : $(this).parent(".voice");
		voice.next(".optionsPanel").slideUp(400,function(){$(this).remove();});
		voice.removeClass("sel");
		$(this).removeClass("sel").css("opacity",.5);
	};

	$.fn.buildMbExtruder=$.mbExtruder.buildMbExtruder;
	$.fn.setMbExtruderContent=$.mbExtruder.setMbExtruderContent;
	$.fn.closeMbExtruder=$.mbExtruder.closeMbExtruder;
	$.fn.openMbExtruder=$.mbExtruder.openMbExtruder;

})(jQuery);