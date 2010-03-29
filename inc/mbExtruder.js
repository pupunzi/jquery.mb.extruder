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
 * Version: 1.8.0
 * dependencies: jquery.metadata.js, jquery.mb.flipV.js, jquery.hoverintent.js
 */

(function($) {
  document.extruder=new Object();
  document.extruder.left = 0;
  document.extruder.top = 0;
  document.extruder.idx=0;
  var isIE=$.browser.msie;

  $.mbExtruder= {
    author:"Matteo Bicocchi",
    version:"1.6",
    defaults:{
      width:350,
      positionFixed:true,
      sensibility:800,
      position:"top",
      top:"auto",
      extruderOpacity:1,
      flapMargin:25,
      textOrientation:"bt", // or "tb" (top-bottom or bottom-top)
      onExtOpen:function(){},
      onExtContentLoad:function(){},
      onExtClose:function(){},
      hidePanelsOnClose:true,
      autoCloseTime:0,
      slideTimer:300
    },

    buildMbExtruder: function(options){
      return this.each (function (){
        this.options = {};
        $.extend (this.options, $.mbExtruder.defaults);
        $.extend (this.options, options);
        this.idx=document.extruder.idx;
        document.extruder.idx++;
        var extruder,extruderContent,wrapper,extruderStyle,wrapperStyle,txt,timer;
        extruder= $(this);
        extruderContent=$(this).html();

        extruder.css("zIndex",100);

        var extW= this.options.position=="left"?1: this.options.width;

        var c= $("<div/>").addClass("content").css({overflow:"hidden", width:extW});
        c.append(extruderContent);
        extruder.html(c);

        var position=this.options.positionFixed?"fixed":"absolute";
        extruder.addClass("extruder");
        extruder.addClass(this.options.position);
        extruderStyle=this.options.position=="top"?
                      {position:position,top:0,left:"50%",marginLeft:-this.options.width/2,width:this.options.width}:
                      {position:position,top:0,left:0,width:1};
        //                      {position:position,top:0,left:-(this.options.width)};
        extruder.css(extruderStyle);
        if(!isIE) extruder.css({opacity:this.options.extruderOpacity});
        extruder.wrapInner("<div class='ext_wrapper'></div>");
        wrapper= extruder.find(".ext_wrapper");

        wrapperStyle={position:"absolute", width:this.options.position=="left"?1:this.options.width};
        wrapper.css(wrapperStyle);


        if (this.options.position=="top"){
          document.extruder.top++;
          if (document.extruder.top>1){
            alert("more than 1 mb.extruder on top is not supported jet... hope soon!");
            return;
          }
        }


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
          extruder.find(".flapLabel").html(txt).css({whiteSpace:"noWrap"});
        }

        if (extruder.attr("extUrl")){
          extruder.setMbExtruderContent({
            url:extruder.attr("extUrl"),
            data:extruder.attr("extData"),
            callback: function(){if (extruder.get(0).options.onExtContentLoad) extruder.get(0).options.onExtContentLoad();}
          });
        }else{
          var container=$("<div>").addClass("text").css({width:extruder.get(0).options.width-20, height:extruder.height()-20, overflowY:"auto"});
          c.wrapInner(container);
          extruder.setExtruderVoicesAction();
        }

        extruder.find('.flap').bind("click",function(){
          extruder.openMbExtruder();
        });

        c.bind("mouseleave", function(){
          $(document).one("click.extruder"+extruder.get(0).idx,function(){extruder.closeMbExtruder();});
          timer=setTimeout(function(){

            if(extruder.get(0).options.autoCloseTime > 0){
              extruder.closeMbExtruder();
            }
          },extruder.get(0).options.autoCloseTime);
        }).bind("mouseenter", function(){clearTimeout(timer); $(document).unbind("click.extruder"+extruder.get(0).idx);});

        if (this.options.position=="left"){
          c.css({ height:"100%"});

          if(this.options.top=="auto") {
            extruder.find('.flap').css({marginRight:-40,top:100+document.extruder.left});
            document.extruder.left+= labelH+this.options.flapMargin;
          }else{
            extruder.find('.flap').css({marginRight:-40,top:this.options.top});
          }
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
      var container=$("<div>").addClass("container").css({width:$(this).get(0).options.width});
      where.find(".content").wrapInner(container);
      $.ajax({
        type: "POST",
        url: url,
        data: data,
        success: function(html){
          where.find(".container").append(html);
          voice=where.find(".voice");
          voice.hover(function(){$(this).addClass("hover");},function(){$(this).removeClass("hover");});
          where.setExtruderVoicesAction();
          if (cb) {
            setTimeout(function(){cb();},100);
          }
        }
      });
    },

    openMbExtruder:function(c){
      var extruder= $(this);
      $(document).unbind("click.extruder"+extruder.get(0).idx);
      var opt= extruder.get(0).options;
      extruder.addClass("open");
      if(!isIE) extruder.css("opacity",1);
      var position= opt.position;
      extruder.mb_bringToFront();
      if (position=="top"){
        extruder.find('.content').slideDown( opt.slideTimer);
        if(opt.onExtOpen) opt.onExtOpen();
      }else{
        if(!isIE) $(this).css("opacity",1);
        extruder.find('.ext_wrapper').css({width:""});
        extruder.find('.content').css({overflowX:"hidden"});
        extruder.find('.content').animate({ width: opt.width}, opt.slideTimer);
        if(opt.onExtOpen) opt.onExtOpen();
      }
      if (c) {
        setTimeout(function(){
          $(document).one("click.extruder"+extruder.get(0).idx,function(){extruder.closeMbExtruder(); console.debug(extruder.get(0).idx)});
        },100);
      }
    },
    closeMbExtruder:function(){
      var extruder= $(this);
      var opt= extruder.get(0).options;
      extruder.removeClass("open");
      $(document).unbind("click.extruder"+extruder.get(0).idx);
      if(!isIE) extruder.css("opacity",opt.extruderOpacity);
      if(opt.hidePanelsOnClose) extruder.hidePanelsOnClose();
      if (opt.position=="top"){
        extruder.find('.content').slideUp(opt.slideTimer);
        if(opt.onExtClose) opt.onExtClose();
      }else if (opt.position=="left"){
        extruder.find('.content').animate({ width: 1 }, opt.slideTimer,function(){
          extruder.find('.ext_wrapper').css({width:1});
          extruder.find('.content').css({overflow:"hidden"});
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
    var voices= $(this).find(".voice");
    voices.each(function(){
      var voice=$(this);
      if ($.metadata){
        $.metadata.setType("class");
        if (voice.metadata().panel) voice.attr("panel",voice.metadata().panel);
        if (voice.metadata().data) voice.attr("data",voice.metadata().data);
        if (voice.metadata().disabled) voice.attr("disabled", voice.metadata().disabled);
      }

      if (voice.attr("disabled"))
        voice.disableExtruderVoice();

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
            extruder.hidePanelsOnClose();
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
                extruder.hidePanelsOnClose();
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
          extruder.hidePanelsOnClose();
          extruder.closeMbExtruder();
        });
      }
    });
  };

  $.fn.disableExtruderVoice=function(){
    var voice=$(this);
    voice.removeClass("sel");
    voice.next(".optionsPanel").slideUp(400,function(){$(this).remove();});
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
    voice.unbind("click");
    voice.find(".settingsBtn").show()
//            .click();
  };

  $.fn.hidePanelsOnClose=function(){
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