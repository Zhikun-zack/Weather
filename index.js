import {maphelper} from './js/maphelper.js'
import {common} from './js/common.js'
import staPoint from './js/station-point.js'
import { getColorMap, getLegend } from './js/colormaps.js'
import { windyShow } from './js/wind.js'

let sktimeline = {}

$(function(){
    //Init baseMap
    common.initMap();
////Left tool bar 
    //When hover on Maps' second tool bar shows the bar when leave hide
    $('.mapSecondTools').hover(function(){
        $(".mapSecondTools").show();
    },function(){
        $(".mapSecondTools").hide();
    })
    //When hover on left tool bar show BUT when leave doesn't hide
    $('#maps').hover(function(){
        $('#maps').css({'background-color':"rgb(51,133,255)"})
        $('#maps-txt').css('color','#fff')
        $('.mapSecondTools').show();
        $(".toolSecondTools").hide();
    },function(){
        $('#maps').css({'background-color':"#fff"})
        $('#maps-txt').css('color','black')
    });
    //When click using switchMap function to change the base map 
    $('.mapSecondTools .text').click(function(e){
        var mapType = e.target.getAttribute('data-type');
        maphelper.switchMap(mapType);
        if(mapType === 'vectormap'){
            $('#img_vector').attr('src','./src/img/political_blue.png');
            $('#img_satellite').attr('src','./src/img/satellite.png');
            $('#img_terr').attr('src','./src/img/topographic.png');
            $("span[data-type = 'vectormap'").css('color','#5c93ff');
            $("span[data-type = 'terr']").css('color','#666666');
            $("span[data-type = 'satellite']").css('color','#666666');
        } else if (mapType === 'satellite'){
            $('#img_vector').attr('src','./src/img/political.png');
            $('#img_satellite').attr('src','./src/img/satellite_blue.png');
            $('#img_terr').attr('src','./src/img/topographic.png');
            $("span[data-type = 'satellite'").css('color','#5c93ff');
            $("span[data-type = 'terr']").css('color','#666666');
            $("span[data-type = 'vectormap']").css('color','#666666');
        } else if (mapType === 'terr'){
            $('#img_vector').attr('src','./src/img/political.png');
            $('#img_satellite').attr('src','./src/img/satellite.png');
            $('#img_terr').attr('src','./src/img/topographic_blue.png');
            $("span[data-type = 'terr'").css('color','#5c93ff');
            $("span[data-type = 'vectormap']").css('color','#666666');
            $("span[data-type = 'satellite']").css('color','#666666')
        }
    });


    //Hover on Tools' second tool bar
    $('.toolSecondTools').hover(function(){
        $(".toolSecondTools").show();
    },function(){
        $(".toolSecondTools").hide();
    });
    //Hover on tools 
    $('#tools').hover(function(){
        $('#tools').css({'background-color':"rgb(51,133,255)"})
        $('#tools-txt').css('color','#fff')
        $('.toolSecondTools').show();
        $(".mapSecondTools").hide();
    },function(){
        $('#tools').css({'background-color':"#fff"})
        $('#tools-txt').css('color','black')
    });
    //Hover on legend
    $('#legends').hover(function(){
        $('#legends').css('background-color','rgb(51,133,255)');
        $('#legend-txt').css('color','#fff');
        $(".mapSecondTools").hide();
        $(".toolSecondTools").hide();
    },function(){
        $('#legends').css('background-color','#fff');
        $('#legend-txt').css('color','black');
    });

    //Top-right tool bar
    //Hover on Scene
    $(".Scene").hover(function(){
        $('.menulist').show()
    },function(){
    });
    $('.menulist').hover(function(){
        $('.menulist').show()
    },function(){
        $('.menulist').hide()
    })

    common.getCityId();
    maphelper.drawChina();
    
    //What happened when click scene button
    $('.RealT').on('click',function(){
        if(!$(this).hasClass('active')){
            $('.menuList li').removeClass('active');
            $(this).addClass('active')

            globalParam.skChecked = true;

            sktimeline.selType = 'sk';
            sktimeline.dataMap = {};
            sktimeline.times = staPoint.datetime;

            globalParam.skId = $(this).attr('id');

            globalParam.staid = $(this).attr('id');
            if(globalParam.staid === '115990104'){
                staPoint.getLastTime(globalParam.staid,"JSON_CHN",1,0);
                windyShow(staPoint.datetime);
            } else{   
                staPoint.getLastTime(globalParam.staid,'Img',1,0);
                getColorMap(staPoint.productCode, staPoint.datetime);
                getLegend(globalParam.staid,'Gis')
                staPoint.getPoint(staPoint.datetime,globalParam.staid,'1000')
            }
        }
    })
})

