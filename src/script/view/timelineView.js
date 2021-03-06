define(['utils/appFunc','utils/tplManager','i18n!nls/lang'],function(appFunc,TM,i18n){

    function init(params){
        appFunc.showToolbar('.views');
        appFunc.bindEvents(params.bindings);

        $$('#ourView .pull-to-refresh-layer').show();

        hiApp.showIndicator();
    }

    function getTimeline(data){
        var renderData = renderDataFunc({
            data:data
        });
        var output = TM.renderTplById('timelineTemplate',renderData);
        $$('#ourView').find('.time-line-content').html(output);

        hiApp.hideIndicator();

        //Unlock scroll loading status
        var ptrContent = $$('#ourView').find('.pull-to-refresh-content');
        ptrContent.data('scrollLoading','unloading');
    }

    function renderDataFunc(options){
        options = options || {};

        var i18next = {
            forward : i18n.timeline.forward,
            comment : i18n.timeline.comment,
            like : i18n.timeline.like
        };

        var renderData = {
            i18n:i18next,
            weibo:options.data,
            image:function(){
                var url = this.original_pic || '';

                if(url.length > 2){
                    var thumbnail = url.replace(/large/, 'thumbnail');
                    return thumbnail;
                }else{
                    return false;
                }
            },
            time:function(){
                return appFunc.timeFormat(this.created_at);
            }
        };
        return renderData;
    }

    function refreshItemTime(){
        $$('#ourView').find('.item-header .detail .create-time').each(function(){
            var nowTime = appFunc.timeFormat($$(this).data('time'));
            $$(this).html(nowTime);
        });
    }

    function refreshTimeline(data){
        // Find newest msg id in ptrContent;

        refreshItemTime();

        var newestId = $$('#ourView').find('.time-line-content .item-content'). eq(0).data('id');

        setTimeout(function () {

            $$('#ourView .refresh-click').find('i').removeClass('ios7-reloading');

            if(parseInt(newestId) === 48) {
                showLoadResult(i18n.index.nothing_loaded);
                hiApp.pullToRefreshDone();
                return false;
            }

            var length = data.length;

            var renderData = renderDataFunc({
                data:data
            });

            var output;

            if(length >= 15){
                output = TM.renderTplById('timelineTemplate',renderData);
                $$('#ourView').find('.time-line-content').html(output);
            }else if(length > 0){
                output = TM.renderTplById('timelineTemplate',renderData);
                $$('#ourView').find('.time-line-content').prepend(output);
            }else{
                showLoadResult(i18n.index.nothing_loaded);
            }

            hiApp.pullToRefreshDone();

        },1500);
    }

    function infiniteTimeline(options){
        options = options || {};

        hiApp.showIndicator();

        var $this = options.$dom;
        var status = $this.data('scrollLoading');
        if (status === 'loading') return;

        $this.data('scrollLoading','loading');

        var timeLimes = options.data;
        var items = $this.find('.time-line-content .item-content');
        var length = items.length;
        var lastId = items.eq(length - 1).data('id');
        if(parseInt(lastId) === 24){

            //I can't hide indicator by javascript, why?
            hiApp.detachInfiniteScroll($this);
            hiApp.hideIndicator();
        }else{
            var renderData = renderDataFunc({
                data: timeLimes
            });
            var output = TM.renderTplById('timelineTemplate', renderData);

            setTimeout(function(){
                $this.data('scrollLoading','unloading');
                $$('#ourView').find('.time-line-content').append(output);

                hiApp.hideIndicator();
            },1500);

        }
    }

    function beforeRefreshTimelineByClick(){
        setTimeout(function(){
            $$('#ourView .refresh-click ').find('i').addClass('ios7-reloading');
            var ptrContent = $$('#ourView').find('.pull-to-refresh-content');
            ptrContent.addClass('pull-up transitioning refreshing');
        },350);
    }

    function showLoadResult(text){
        setTimeout(function(){
            $$('#ourView .load-result').html(text).css('opacity','1').transition(1000);

            setTimeout(function(){
                $$('#ourView .load-result').css('opacity','0').transition(1000);
            },2100);
        },400);
    }

    return{
        init:init,
        getTimeline:getTimeline,
        refreshTimeline:refreshTimeline,
        infiniteTimeline:infiniteTimeline,
        beforeRefreshTimelineByClick:beforeRefreshTimelineByClick
    };
});