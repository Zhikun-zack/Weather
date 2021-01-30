import atdts from './atdt'
import {maphelper} from './maphelper';
import {EchartsLayer} from './echartslayer'

let sktimeline = sktimeline || {};
let globalChart;
let staPoint = {};
let resultall = {},resultyb,resultsk,resultsp,tenRange,hover,isshow,ybshow; //实况、预报、历史同期相关全局变量
//Used to contain all the 'list' data value getting from http://data.cma.cn/dataGis/exhibitionData/getMarker
staPoint.rangeallList = [];

/**
 * 初始化站点的echart
 */
staPoint.initStaEchart = function () {

    staPoint.overlay = new EchartsLayer({
        animation: false,
        coordinateSystem: 'leaflet',
        backgroundColor: 'transparent',
    }).addTo(maphelper.map)
    staPoint.myChart = staPoint.overlay._ec
}

/**
 * 清除echart站点
 */
staPoint.clearEchartPoint = function () {
    staPoint.option = null;
    let option1 = staPoint.getFinalOptions()
    staPoint.overlay.setOption(option1,true);
    staPoint.overlay.off('click',staPoint.pointClick)
    maphelper.map.off('zoomend',staPoint.zoomEnd)
}

//Sending ajax quest and invoking 'drawPoint' function to draw 
staPoint.getPoint = function(dttime,funitemmenuid,province){
    $.ajax({
        url: ctx +'/exhibitionData/getMarker',
        type: 'get',
        dataType : 'json',
        async : true,
        data:{
            dateTime: dttime,
            funitemmenuid: funitemmenuid,
            province: province,
            typeCode: 'NWST',
        },
        success: function(result){
			staPoint.eleAttr = result.eleValue;
			if(province === '1000'){
				
				staPoint.drawPoint(result, funitemmenuid,globalParam.splitList);
				console.log('ok');
			} 
        }
    })
}

/**Using echart to draw all station Points
 * param splitList: color and range of each level, get from colormap.js setDataRange
 * */
staPoint.drawPoint = function (result, funitemmenuid, splitList) {
    if (funitemmenuid == 115990104 || funitemmenuid == 115990108 || funitemmenuid == 115990109 || funitemmenuid == 115990110 || funitemmenuid == 115990111) {
        //如果是风，则进行画风向杆图标
        staPoint.drawWindPoint(result, funitemmenuid, splitList);
        return;
    }
    let list = result.list;
	let length = list.length;

    let eleAttr = result.eleValue;
    let unit = result.unit;
    let arrEle = eleAttr.split(",");
    if (length > 0) {
        let data = [];
        var echartsData = []
        let geoCoordMap = {};
        for (let i = 0; i < length; i++) {
            let obj1 = {};
            obj1.name = list[i][arrEle[0]];
            obj1.value = list[i][arrEle[6]];
            obj1.stationId = list[i][arrEle[1]];
            obj1.stationName = list[i][arrEle[0]];
            obj1.lat = list[i][arrEle[2]];
            obj1.lon = list[i][arrEle[3]];
            obj1.stationLev = list[i][arrEle[5]];
            obj1.funitemmenuid = funitemmenuid;
            obj1.unit = unit;
            data.push(obj1);
            let obj2 = [];
            obj2.push(list[i][arrEle[3]]);
            obj2.push(list[i][arrEle[2]]);
            geoCoordMap[obj1.name] = obj2;
            echartsData.push([list[i][arrEle[3]],list[i][arrEle[2]], obj1.value,obj1])
        }
	}
	console.log(echartsData)
	////////////////////////////////////////////////////
	let isShow = true;

    let pieces = [];
    let colors = [];
    splitList.forEach(function(item){
        let temp = {}
        if(item.start!==undefined){
            temp.gt = item.start;
        }
        if(item.end!==undefined){
            temp.lte = item.end;
        }
        pieces.push(temp)
        colors.unshift(item.color)
    })



    let visualMap = {
        type: 'piecewise',
        show: false,
        dimension: '2',
        top: 10,
        pieces:pieces,
        color: colors,
        orient: "horizontal"
    }

    let option = {
        animation: false,
        coordinateSystem: 'leaflet',
        backgroundColor: 'transparent',
        visualMap: visualMap,

        toolbox: {
            iconStyle: {
                normal: {
                    borderColor: '#fff',
                    fontSize: "14px"
                },
                emphasis: {
                    borderColor: '#b1e4ff'
                }
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                let station = params.data[3];
                return station.name+":"+station.value+station.unit
            }
        },
        series: [{
            name: "sk",
            type: 'scatter',
            symbolSize: 5, // 标注大小，半宽（半径）参数，当图形为方向或菱形则总宽度为symbolSize * 2
            symbol: 'circle',
            coordinateSystem: 'leaflet',
            label: {
                show: isShow,
                formatter:function(params){
                    let station = params.data[3];
                    return station.value+station.unit
                },

                position: 'right',

                textStyle: {
                    color: '#000',
                    fontSize: 12,
                    fontWeight:'bold'
                },
                emphasis: {
                    symbolSize: 8
                }
            },
            itemStyle: {
                normal: {
                    borderColor: '#555',
                    borderWidth: 1,            // 标注边线线宽，单位px，默认为1
                },
                emphasis: {
                    borderColor: '#333',
                    borderWidth: 5,
                    label: {
                        show: false
                    }
                }
            },
            data: echartsData
        }]
    }
    staPoint.option = option;

    let option1 = staPoint.getFinalOptions()

    staPoint.overlay.setOption(option1,true);



    staPoint.myChart.off('click',staPoint.pointClick );
    staPoint.myChart.off('click',staPoint.windClick );
    maphelper.map.off("zoomend",staPoint.zoomEnd)
    maphelper.map.on("zoomend",staPoint.zoomEnd)
    globalChart = staPoint.myChart;
    staPoint.myChart.on('click',staPoint.pointClick);
}

staPoint.getFinalOptions = function(){
    let option1 ={
        animation: false,
        coordinateSystem: 'leaflet',
        backgroundColor: 'transparent'
    };
    if(staPoint.option){
        $.extend(true,option1,staPoint.option)
        if(atdts.option){
            option1.series.push(atdts.option.series[0])
        }

    }else{
        if(atdts.option){
            $.extend(true,option1,atdts.option)
        }
    }
    return option1;
}

//Get the newest time
staPoint.getLastTime = function (funItemMenuId, position, isDefault, timeDifference) {
	$.ajax({
		url : ctx + "/multiExhibition/autoStationNewTime",
		type : "post",
		dataType : "json",
		async : false,
		data : {
			funItemMenuId : funItemMenuId,
			position : position,
			isDefault : isDefault,
			timeDifference : timeDifference
		},
		success : function(result) {
			if (result != undefined && result !== "") {
				staPoint.timeStr=result.timeStr;
				staPoint.datetime = result.datetime;
				staPoint.productCode = result.productCode;
				let time = staPoint.datetime;
				if(time == undefined || time === ""){
					let date = new Date();
					time = date.format("yyyy-MM-dd HH") + "时";
				}else{
					time = time.substring(0,4)+ "-" + time.substring(4,6)+ "-" + time.substring(6,8)+ " " + time.substring(8,10) + "时";
				}
			}else{

			}
		}
	});
}
//

export default staPoint