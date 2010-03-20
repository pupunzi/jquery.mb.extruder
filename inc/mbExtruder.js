/*******************************************************************************
 jquery.mb.components
 Copyright (c) 2001-2010. Matteo Bicocchi (Pupunzi); Open lab srl, Firenze - Italy
 email: info@pupunzi.com
 site: http://pupunzi.com

 Licences: MIT, GPL
 http://www.opensource.org/licenses/mit-license.php
 http://www.gnu.org/licenses/gpl.html
 ******************************************************************************/

/*
 * Name:jquery.mb.extruder
 * Version: 1.6.5
 * dependencies: jquery.metadata.js, jquery.mb.flipV.js, jquery.hoverintent.js
 */

(function($) {
  document.extruderLeft = 0;
  document.extruderTop = 0;
  var isIE=$.browser.msie;

  $.mbExtruder= {
    author:"Matteo Bicocchi",
    version:"1.6",
    defaults:{
      width:350,
      positionFixed:true,
      sensibility:800,
      position:"top",
      extruderOpacity:1,
      flapDim:100,
      flapMargin:25,
      textOrientation:"bt", // or "tb" (top-bottom or bottom-top)
      onExtOpen:function(){},
      onExtContentLoad:function(){},
      onExtClose:function(){},
      closeAllPanels:true,
      slideTimer:300
    },

    buildMbExtruder: function(options){
      return this.each (function (){
        this.options = {};
        $.extend (this.options, $.mbExtruder.defaults);
        $.extend (this.options, options);
        var extruder,extruderContent,wrapper,extruderStyle,wrapperStyle,txt,timer;
        extruder= $(this);
        extruderContent=$(this).html();

        extruder.css("zIndex",100);

        var c= $("<div/>").addClass("content");
        c.append(extruderContent);
        extruder.html(c);

        var position=this.options.positionFixed?"fixed":"absolute";

        if (this.options.position=="top"){
          document.extruderTop++;
          if (document.extruderTop>1){
            alert("more than 1 mb.extruder on top is not supported jet... hope soon!");
            return;
          }
        }

        extruder.addClass("extruder");
        extruder.addClass(this.options.position);
        extruderStyle=this.options.position=="top"?
                      {position:position,top:0,left:"50%",marginLeft:-this.options.width/2,width:this.options.width}:
                      {position:position,top:0,left:-(this.options.width)};
        extruder.css(extruderStyle);
        if(!isIE) extruder.css({opacity:this.options.extruderOpacity});
        extruder.wrapInner("<div class='ext_wrapper'></div>");
        wrapper= extruder.find(".ext_wrapper");
        wrapperStyle={width:this.options.width,position:"absolute"};
        wrapper.css(wrapperStyle);

        if ($.metadata){
          $.metadata.setType("class");
          if (extruder.metadata().title) extruder.attr("extTitle",extruder.metadata().title);
          if (extruder.metadata().url) extruder.attr("extUrl",extruder.metadata().url);
          if (extruder.metadata().data) extruder.attr("extData",extruder.metadata().data);
        }
        wrapper.append("<div class='footer'></div><div class='flap'><span class='flapLabel'/></div>");

        txt=extruder.attr("extTitle")?extruder.attr("extTitle"): "";
        extruder.find(".flapLabel").text(txt);
        if(this.options.position=="left"){
          extruder.find(".flapLabel").html(txt).css({whiteSpace:"noWrap"});//,height:this.options.flapDim
          var orientation= this.options.textOrientation == "tb";
          var labelH=extruder.find('.flapLabel').getFlipTextDim()[1];
          extruder.find('.flapLabel').mbFlipText(orientation);
        }else{
          extruder.find(".flapLabel").html(txt).css({whiteSpace:"noWrap",width:this.options.flapDim});
        }

        if (extruder.attr("extUrl")){
          extruder.setMbExtruderContent({
            url:extruder.attr("extUrl"),
            data:extruder.attr("extData"),
            callback: function(){if (extruder.get(0).options.onExtContentLoad) extruder.get(0).options.onExtContentLoad();}
          });
        }else{
          var container=$("<div>").addClass("text");
          c.wrapInner(container);
          extruder.setExtruderVoicesAction();
        }
        extruder.find('.flap .flapLabel').hoverIntent({
          over: function(){
            extruder.mb_bringToFront();
            extruder.openMbExtruder();
          },
          out: function(){},
          sensitivity: 2,
          interval: this.options.sensibility
        });
        extruder.find('.flap').bind("click",function(){
          extruder.openMbExtruder();
        });
        c.bind("mouseleave", function(){
          timer=setTimeout(function(){
            extruder.closeMbExtruder();
          },1000);
        }).bind("mouseenter", function(){clearTimeout(timer);});

        if (this.options.position=="left"){
          c.css({width:this.options.width, height:"100%"});
          extruder.find('.flap').css({marginRight:-40,top:100+document.extruderLeft});
          document.extruderLeft+= labelH+this.options.flapMargin;
          var clicDiv=$("<div/>").css({position:"absolute",top:0,left:0,width:"100%",height:"100%",background:"transparent"});
          extruder.find('.flap').append(clicDiv);

        }
      });
    },

    setMbExtruderContent: function(options){
      this.options = {
        url:false,
        data:"",
        callback:function(){}
      };
      $.extend (this.options, options);

      if (!this.options.url || this.options.url.length==0){
        alert("internal error: no URL to call");
        return;
      }
      var url=this.options.url;
      var data=this.options.data;
      var where=$(this), voice;
      var cb= this.options.callback;
      $.ajax({
        type: "POST",
        url: url,
        data: data,
        success: function(html){
          where.find(".content").append(html);
          voice=where.find(".voice");
          voice.hover(function(){$(this).addClass("hover");},function(){$(this).removeClass("hover");});
          where.setExtruderVoicesAction();
          if (cb) {
            setTimeout(function(){cb();},100);
          }
        }
      });
    },

    openMbExtruder:function(){
      var extruder= $(this);
      extruder.addClass("open");
      if(!isIE) extruder.css("opacity",1);
      var position= extruder.get(0).options.position;
      extruder.mb_bringToFront();
      if (position=="top"){
        extruder.find('.content').slideDown( extruder.get(0).options.slideTimer);
        if(extruder.get(0).options.onExtOpen) extruder.get(0).options.onExtOpen();
      }else{
        if(!isIE) $(this).css("opacity",1);
        extruder.animate({ left: 0 }, extruder.get(0).options.slideTimer);
        if(extruder.get(0).options.onExtOpen) extruder.get(0).options.onExtOpen();
      }
    },

    closeMbExtruder:function(){
      var extruder= $(this);
      var opt= extruder.get(0).options;
      extruder.removeClass("open");
      if(!isIE) extruder.css("opacity",opt.extruderOpacity);
      if(opt.closeAllPanels) extruder.closeAllPanels();
      if (opt.position=="top"){
        extruder.find('.content').slideUp(opt.slideTimer);
        if(opt.onExtClose) opt.onExtClose();
      }else if (opt.position=="left"){
        extruder.animate({ left: -opt.width }, opt.slideTimer,function(){
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
    var opt= extruder.get(0).options;
    var voices= $(this).find(".voice");
    voices.each(function(){
      var voice=$(this);
      if ($.metadata){
        $.metadata.setType("class");
        if (voice.metadata().panel) voice.attr("panel",voice.metadata().panel);
        if (voice.metadata().data) voice.attr("data",voice.metadata().data);
        if (voice.metadata().disabled) voice.attr("disabled", voice.metadata().disabled);
      }

      if (voice.attr("disabled")){
        voice.disableExtruderVoice();
      }

      if (voice.attr("panel") && voice.attr("panel")!="false"){
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
            extruder.closeAllPanels();
            return;
          }
          extruder.find(".optionsPanel").slideUp(400,function(){$(this).remove();});
          voices.removeClass("sel");
          voices.find(".settingsBtn").removeClass("sel").css({opacity:.5});
          var content=$("<div class='optionsPanel'></div>");
          $.ajax({
            type: "POST",
            url: voice.attr("panel"),
            data: voice.attr("data"),
            success: function(html){
              var c= $(html);
              content.html(c);
              content.children()
                      .addClass("panelVoice")
                      .click(function(){
                extruder.closeAllPanels();
                extruder.closeMbExtruder();
              });
              content.slideDown(400);
            }
          });
          voice.after(content);
          voice.addClass("sel");
          voice.find(".settingsBtn").addClass("sel").css({opacity:1});
        });
      }

      if (voice.find("a").length==0 && voice.attr("panel")){
        voice.find(".label").not(".disabled").css("cursor","pointer").click(function(){
          voice.find(".settingsBtn").click();
        });
      }

      if ((!voice.attr("panel") ||voice.attr("panel")=="false" ) && (!voice.attr("disabled") || voice.attr("disabled")!="true")){
        voice.find(".label").click(function(){
          extruder.closeAllPanels();
          extruder.closeMbExtruder();
        });
      }
    });

  };

  $.fn.disableExtruderVoice=function(){
    var voice=$(this);
    voice.attr("disabled",true);
    voice.find(".label").css("opacity",.4);
    voice.hover(function(){$(this).removeClass("hover");},function(){$(this).removeClass("hover");});
    voice.find(".label").addClass("disabled").css("cursor","default");
    voice.find(".settingsBtn").hide();
    voice.bind("click",function(event){
      event.stopPropagation();
      return false;
    });
  };

  $.fn.enableExtruderVoice=function(){
    var voice=$(this);
    voice.attr("disabled",false);
    voice.find(".label").css("opacity",1);
    voice.find(".label").removeClass("disabled").css("cursor","pointer");
    voice.find(".settingsBtn").show();
    voice.unbind("click");
  };

  $.fn.closeAllPanels=function(){
    var voices= $(this).find(".voice");
    $(this).find(".optionsPanel").slideUp(400,function(){$(this).remove();});
    voices.removeClass("sel");
    voices.find(".settingsBtn").removeClass("sel").css("opacity",.5);
  };

  $.fn.buildMbExtruder=$.mbExtruder.buildMbExtruder;
  $.fn.setMbExtruderContent=$.mbExtruder.setMbExtruderContent;
  $.fn.closeMbExtruder=$.mbExtruder.closeMbExtruder;
  $.fn.openMbExtruder=$.mbExtruder.openMbExtruder;

})(jQuery);