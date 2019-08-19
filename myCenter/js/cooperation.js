

$(function(){
	layui.use('layer',function () {
		var layer = layui.layer;
	})
})
			




var pc = new Vue({
	el: "#main",
	data: {
		allTypeContent: ["所有彩种","传统足球", "竞彩足球","足球单场"],
		allStateContent: ["所有状态", "未满员", "已满员", "已撤单"],
		changeDateContent: ["今天", "昨天", "本周", "上周", "本月", "上月"],
		startTime:"",
		endTime:"",
		type:"",
		state:"",
		dateContent: "今天",
		stateContent:"所有状态",
		typeContent: "所有彩种",
		page_num:5,
		totalPage:'',
		orders:[],  //订单详情
		datasArr:[], //投注详情
		moreArr:[],
		ordersData:[],
		agencyType: localStorage.agencyType ? localStorage.agencyType : 2,//用户类型
	},
	created: function() {
		this.initUserInfo();
		this.selectTime(0);  //默认查询今天
		if(localStorage.userType==2){
			$(".registerFree").hide();
		}
	},
	methods: {
		//select设置----触发元素事件
		openType: function(e, index) {
			var e = e.currentTarget,
				_this = this;
			if ($(e).is(".isClick")) {
				return
			}
			$(e).addClass("isClick");
			switch(index) {
				case 1:
					$(e).next().toggle('hide');
					break;
				case 2:
					$(e).next().show();
					break;
				case 3:
					$(e).next().hide();
					break;
			}
			setTimeout(function () {
				$(e).removeClass("isClick");
			}, 1000)
		},
		//select设置----显示元素事件
		hoverTypeUl: function(e, index) {
			var e = e.currentTarget,
				_this = this;
			switch(index) {
				case 1:
					$(e).show();
					break;
				case 2:
					$(e).hide();
					break;
			}

		},
		//select设置-----选项事件设置
		getCondition: function(type, index,e) {
			var _this=this;
			e = e.currentTarget;
			$(e).parent().hide();
			switch(type) {
				case 0:
					if(index==0){
						_this.type="";
					}else{
						_this.type=index;
					}
					_this.typeContent=_this.allTypeContent[index];
//					_this.getdatas(1)
					break;
				case 1:
					if(index==0){
						_this.state="";
					}else{
						_this.state=index;
					}
					_this.stateContent=_this.allStateContent[index];
//					_this.getdatas(1)
					break;
				case 2:
					_this.dateTime=index;
					_this.dateContent=_this.changeDateContent[index];
					_this.selectTime(index);
//					_this.getdatas(1)
					break;
				default:
					break;
			}
		},
		choose_nav:function(index){
			var _this=this;
			$(".topNav #choose_"+index).addClass("active").siblings().removeClass("active");
			$("#record #show_"+index).show().siblings().hide();
			if(index==0){
				_this.getdatas(1);
			}else{
				_this.selectdatas(1);
			}
			
		},
		toPercent:function(point){
            var str = Number(point * 100).toFixed(1);
            str += "%";
            return str;
        },
        
		//查询发起合买
		getdatas: function(num) {
			var _this = this;
			var uname = localStorage.getItem("userName");
			var data = {
				'pageIndex': num,
                'pageNum': this.page_num,
//              'pageSize': 5,
                
                
				'username': uname,
				'status': _this.state,
				'startTime': this.startTime?this.startTime:$("#startTime").val(),
				'endTime': this.endTime?this.endTime:$("#endTime").val(),
				'typeId':_this.type,
				
			};
				var obj = {
					type: 'post',
					data: data,
					dataType: 'json',
					url: '/authApi/bets/getInitiateBuyRecord',
					success: function(data) {
						if (data.body) {
							_this.datasArr=data.body.list;
							for(var i=0;i<_this.datasArr.length;i++){
	                            _this.datasArr[i].percent=_this.toPercent(_this.datasArr[i].currentPieces/_this.datasArr[i].totalPieces);
//	                            $(".pro_bar .solid").eq(i).css("width",_this.datasArr[i].percent);
                            	_this.datasArr[i].guaranteedPieces=_this.toPercent(_this.datasArr[i].guaranteedPieces/_this.datasArr[i].totalPieces)
                           	}
                  			$(".show-if").hide();
                  			$(".showBetRecord").children(".show-if").attr("isClick","1");
								//分页的(右边点击)
	                        if(data.body.list.length>0){
	                            $('#fenye').jqPaginator('option', {
	                                totalPages: data.body.pageSize,    //返回总页数
	                                currentPage: 1
	                            });
	                        }else {
	                            $('#fenye').jqPaginator('option', {
	                                totalPages: 1,
	                                currentPage: 1
	                            });
	                        }
	                        $(".showBetRecord").show();
	                        $(".betResultOrder").hide();
						}else{
							$('#fenye').jqPaginator('option', {
	                                totalPages: 1,
	                                currentPage: 1
	                            });
							$(".betResultOrder").show();
							$(".showBetRecord").hide();
						}
						//_this.datas = data.body.list;
						//_this.datas.push(data.body.list);
					},
					error: function(msg) {
					}
				};
				base.callAuthApi(obj);
		},
		selectMore:function(index){
			var _this=this;
			_this.moreArr=_this.datasArr[index]
			$(".show-if").hide();
			
			if($(".showBetRecord").eq(index).children(".show-if").attr("isClick")==1){
				$(".showBetRecord").eq(index).children(".show-if").attr("isClick","2").show();
				$(".showBetRecord").eq(index).siblings().children(".show-if").attr("isClick","1");
			}else{
				$(".showBetRecord").children(".show-if").attr("isClick","1").hide();
			}
			
			if(_this.moreArr.totalBonus!=null){
				_this.moreArr.oneBonus=parseInt(_this.moreArr.totalBonus/_this.moreArr.totalPieces).toFixed(2);
				_this.moreArr.totalBonus=parseInt(_this.moreArr.totalBonus).toFixed(2);
			}
		},
		//查看投注详情
		selectdatasById: function(actionDataStr,type) {
			var _this = this;
			var uname = localStorage.getItem("userName");
			var data = {
				'username': uname,
				'type': type,
				'actionData':actionDataStr,
			};
				var obj = {
					type: 'post',
					data: data,
					dataType: 'json',
					url: '/authApi/bets/getBettingInfoDetail',
					success: function(data) {
					if(data.code == 200) {
							_this.orders = data.body;
							layui.use('layer', function () {
			                var layer = layui.layer;
				                layer.open({
				                    title: '查看订单详情',
				                    type: 1,
				                    content: $('.bytypeId'),
				                    area: ['600px','250px'],
				                    btn: ['关闭'],
				                    yes: function (index, layero) {
				                        layer.closeAll('page');
				                    }
				                    
				                })
		            		})
							
						}else{
//							layer.msg('暂无数据');
						}
					},
					error: function(msg) {
					}
				};
				base.callAuthApi(obj);
		},
		//查询参与合买
		selectdatas: function(num) {
			var _this = this;
			var uname = localStorage.getItem("userName");
			var data = {
				'pageIndex': num,
                'pageNum': this.page_num,
//              'pageSize': 5,
                
                
				'username': uname,
				'status': _this.state,
				'startTime': this.startTime?this.startTime:$("#startTime").val(),
				'endTime': this.endTime?this.endTime:$("#endTime").val(),
			};
				var obj = {
					type: 'post',
					data: data,
					dataType: 'json',
					url: '/authApi/bets/getBuyInRecord',
					success: function(data) {
						if(data.code == 200) {
							_this.ordersData = data.body.list;
							for(var i=0;i<_this.ordersData.length;i++){
								_this.ordersData[i].scale=_this.toPercent(_this.ordersData[i].buyPieces/_this.ordersData[i].buyTotalMoney);
								
							}

							if(data.body.list.length>0){
	                            $('#fenye').jqPaginator('option', {
	                                totalPages: data.body.pageSize,    //返回总页数
	                                currentPage: 1
	                            });
	                        }else {
	                            $('#fenye').jqPaginator('option', {
	                                totalPages: 1,
	                                currentPage: 1
	                            });
	                        }
	                        $(".showBetRecord").show();
	                        $(".betResultOrder").hide();
						}else{
							$('#fenye').jqPaginator('option', {
	                                totalPages: 1,
	                                currentPage: 1
	                            });
							$(".betResultOrder").show();
							$(".showBetRecord").hide();
						}
						//_this.datas = data.body.list;
						//_this.datas.push(data.body.list);
					},
					error: function(msg) {
					}
				};
				base.callAuthApi(obj);
		},
		
		selectTime: function(index) {
//			$("#time").children().remove();
//			$("#time").html("<label><b></b><input type=\'text\' id=\'startTime\' v-model=\'startTime\' readonly placeholder=\'开始时间\'/></label>&nbsp;至&nbsp;<label><b></b><input type=\'text\' id=\'endTime\' v-model=\'endTime\' readonly placeholder=\'结束时间\'/></label>&nbsp;<span class=\'btn\' id=\'select\' @click=\'getdatas()\'>查询</span>");
			var s1, s2, dateTime = new Date();;
			switch(index+1) {
				case 1: //今天
					dateTime.setTime(dateTime.getTime());
					s2 = dateTime.getFullYear() + "-" + this.getzf(dateTime.getMonth() + 1) + "-" + this.getzf(dateTime.getDate());
					this.startTime = s2 + " " + "00:00:00";
					this.endTime = s2 + " " + "23:59:59";
					break;
				case 2: //昨天
					dateTime.setTime(dateTime.getTime() - 24 * 60 * 60 * 1000);
					s1 = dateTime.getFullYear() + "-" + this.getzf(dateTime.getMonth() + 1) + "-" + this.getzf(dateTime.getDate());
					this.startTime = s1 + " " + "00:00:00";
					this.endTime = s1 + " " + "23:59:59";
					break;
				case 3: //本周
					st = this.getDateTime(0);
					et = dateTime.getFullYear() + "-" + this.getzf(dateTime.getMonth() + 1) + "-" + this.getzf(dateTime.getDate());
					this.startTime = st + " " + "00:00:00";
					this.endTime = et + " " + "23:59:59";
					break;
				case 4: //上周
					st = this.getDateTime(2);
					et = this.getDateTime(3);
					this.startTime = st + " " + "00:00:00";
					this.endTime = et + " " + "23:59:59";
					break;
				case 5: //本月
					st = this.getDateTime(4);
					et = dateTime.getFullYear() + "-" + this.getzf(dateTime.getMonth() + 1) + "-" + this.getzf(dateTime.getDate());
					this.startTime = st + " " + "00:00:00";
					this.endTime = et + " " + "23:59:59";
					break;
				case 6: //上月
					st = this.getDateTime(6);
					et = this.getDateTime(7);
					this.startTime = st + " " + "00:00:00";
					this.endTime = et + " " + "23:59:59";
					break;
				default:
					break;
			}
//		
//			laydate.render({
//				elem: '#startTime', //指定元素
//				format: 'yyyy-MM-dd HH:mm:ss',
//				type: 'datetime',
//				min: this.startTime, //设定最小日期为当前日期  
//		        max: this.endTime, //最大日期  
//		        istime: true, //必须填入时间  
//		        istoday: false,  //是否是当天  
//		        start: this.startTime,  //设置开始时间为当前时间  
//		        choose: function(datas){  
//		             this.endTime.min = datas; //开始日选好后，重置结束日的最小日期  
//		             this.endTime.start = datas //将结束日的初始值设定为开始日  
//		        }  
//			});
//			laydate.render({
//				elem: '#endTime',
//				format: 'yyyy-MM-dd HH:mm:ss',
//				type: 'datetime',
//				min: this.startTime,  
//		        max: this.endTime,  
//		        istime: true,  
//		        istoday: false,  
//		        start: this.startTime<this.endTime,  
//		        choose: function(datas){  
//		            this.startTime.max = datas; //结束日选好后，重置开始日的最大日期  
//		        }  
//			});
			
		},

		//日期设置
		getDateTime: function(index) {
			var now = new Date(); //当前日期
			var nowDayOfWeek = now.getDay(); //今天本周的第几天
			var nowDay = now.getDate(); //当前日
			var nowMonth = now.getMonth(); //当前月
			var nowYear = now.getYear(); //当前年
			nowYear += (nowYear < 2000) ? 1900 : 0; //
			var lastMonthDate = new Date(); //上月日期
			lastMonthDate.setDate(1);
			lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
			var lastYear = lastMonthDate.getYear();
			var lastMonth = lastMonthDate.getMonth();
			//格式化日期：yyyy-MM-dd
			function formatDate(date) {
				var myyear = date.getFullYear();
				var mymonth = date.getMonth() + 1;
				var myweekday = date.getDate();
				if(mymonth < 10) {
					mymonth = "0" + mymonth;
				}
				if(myweekday < 10) {
					myweekday = "0" + myweekday;
				}
				return(myyear + "-" + mymonth + "-" + myweekday);
			}

			//获得某月的天数
			function getMonthDays(myMonth) {
				var monthStartDate = new Date(nowYear, myMonth, 1);
				var monthEndDate = new Date(nowYear, myMonth + 1, 1);
				var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
				return days;
			}

			//获得本季度的开始月份
			function getQuarterStartMonth() {
				var quarterStartMonth = 0;
				if(nowMonth < 3) {
					quarterStartMonth = 0;
				}
				if(2 < nowMonth && nowMonth < 6) {
					quarterStartMonth = 3;
				}
				if(5 < nowMonth && nowMonth < 9) {
					quarterStartMonth = 6;
				}
				if(nowMonth > 8) {
					quarterStartMonth = 9;
				}
				return quarterStartMonth;
			}

			//获得本周的开始日期
			function getWeekStartDate() {
				var weekStartDate = new Date(nowYear, nowMonth, nowDay + 1 - nowDayOfWeek);
				return formatDate(weekStartDate);
			}

			//获得本周的结束日期
			function getWeekEndDate() {
				var weekEndDate = new Date(nowYear, nowMonth, nowDay + (7 - nowDayOfWeek));
				return formatDate(weekEndDate);
			}

			//获得上周的开始日期
			function getLastWeekStartDate() {
				var weekStartDate = new Date(nowYear, nowMonth, nowDay + 1 - nowDayOfWeek - 7);
				return formatDate(weekStartDate);
			}

			//获得上周的结束日期
			function getLastWeekEndDate() {
				var weekEndDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek);
				return formatDate(weekEndDate);
			}

			//获得本月的开始日期
			function getMonthStartDate() {
				var monthStartDate = new Date(nowYear, nowMonth, 1);
				return formatDate(monthStartDate);
			}

			//获得本月的结束日期
			function getMonthEndDate() {
				var monthEndDate = new Date(nowYear, nowMonth, getMonthDays(nowMonth));
				return formatDate(monthEndDate);
			}

			//获得上月开始时间
			function getLastMonthStartDate() {
				var lastMonthStartDate = new Date(nowYear, lastMonth, 1);
				return formatDate(lastMonthStartDate);
			}

			//获得上月结束时间
			function getLastMonthEndDate() {
				var lastMonthEndDate = new Date(nowYear, lastMonth, getMonthDays(lastMonth));
				return formatDate(lastMonthEndDate);
			}

			//获得本季度的开始日期
			function getQuarterStartDate() {
				var quarterStartDate = new Date(nowYear, getQuarterStartMonth(), 1);
				return formatDate(quarterStartDate);
			}

			//或的本季度的结束日期
			function getQuarterEndDate() {
				var quarterEndMonth = getQuarterStartMonth() + 2;
				var quarterStartDate = new Date(nowYear, quarterEndMonth,
					getMonthDays(quarterEndMonth));
				return formatDate(quarterStartDate);
			}

			if(index == 0) {
				var k = getWeekStartDate();
				return k
			} else if(index == 1) {
				var k = getWeekEndDate();
				return k
			} else if(index == 2) {
				var k = getLastWeekStartDate();
				return k
			} else if(index == 3) {
				var k = getLastWeekEndDate();
				return k
			} else if(index == 4) {
				var k = getMonthStartDate();
				return k
			} else if(index == 5) {
				var k = getMonthEndDate();
				return k
			} else if(index == 6) {
				var k = getLastMonthStartDate();
				return k
			} else if(index == 7) {
				var k = getLastMonthEndDate();
				return k
			}
		},
		//补0
		getzf: function(num) {
			if(parseInt(num) < 10) {
				num = '0' + num;
			}
			return num;
		},
		//初始化用户信息
		initUserInfo: function() {
			var userName = localStorage.getItem("userName");
			if(userName){
//				base.heartbeat(localStorage.getItem("userName"));
				var getUserInfo ={
					type:"post",
				    url:"/authApi/AutoLoginGetUserinfoByRedis",
				    data:{"username":userName},
				    success : function(data){
				     	if(data.code==200){
									var coin = parseFloat(data.body.COIN).toFixed(2);
									var fCoin = parseFloat(data.body.FCION).toFixed(2);
				     		$("strong.userName").html(data.body.USER_NAME);
							$("#coin11").html(coin);
							$("#lastTime").html(data.body.LAST_LOGIN_TIME);
				     	}
				    }
				}
				base.callAuthApi(getUserInfo);
			}else{
				location.href="/login/login.html";
			}
		}
	},
	watch:{
        //监听页码下拉框的值
        page_num: function () {
            this.getdatas(1);
        }
    },
    beforeDestroy:function(){
        document.removeEventListener('keyup');
    }
});

// 加载分页功能
$.jqPaginator('#fenye', {
    totalPages: 1,      //多少页数据
    visiblePages: 10,   //最多显示几页
    currentPage: 1,     //当前页
    wrapper: '<ul class="pagination"></ul>',
    first: '<li class="first"><a href="javascript:void(0);">首页</a></li>',
    prev: '<li class="prev"><a href="javascript:void(0);">上一页</a></li>',
    next: '<li class="next"><a href="javascript:void(0);">下一页</a></li>',
    last: '<li class="last"><a href="javascript:void(0);">尾页</a></li>',
    page: '<li class="page"><a href="javascript:void(0);">{{page}}</a></li>',

    onPageChange: function (num, type) {
        pc.getdatas(num);
        pc.selectdatas(num);
    }
});