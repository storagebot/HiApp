define(['utils/appFunc'],function(appFunc) {

    //var apiServerHost = window.location.href;

    function search(code, array){
        for (var i=0;i< array.length; i++){
            if (array[i].code === code) {
                return array[i];
            }
        }
        return false;
    }

    function getRequestURL(options){
        //var host = apiServerHost || window.location.host;
        //var port = options.port || window.location.port;
        var query = options.query || {};
        var func = options.func || '';

        var apiServer = 'api/' + func + '.json' +
                        (appFunc.isEmpty(query) ? '' : '?');

        var name;
        for (name in query) {
            apiServer += name + '=' + query[name] + '&';
        }

        return apiServer.replace(/&$/gi, '');
    }

    function simpleCall(options,callback){
        options = options || {};
        options.data = options.data ? options.data : '';

        //If you access your server api ,please user `post` method.
        options.method = options.method || 'GET';
//        options.method = options.method || 'POST';

        $$.ajax({
            url: getRequestURL(options) ,
            method: options.method,
            data: options.data,
            success:function(data){
                data = data ? JSON.parse(data) : '';

                var codes = [
                    {code:10000, message:'Your session is invalid, please login again',path:'/'},
                    {code:10001, message:'Unknown error,please login again',path:'tpl/login.html'},
                    {code:20001, message:'User name or password does not match',path:'/'}
                ];

                var codeLevel = search(data.err_code,codes);

                if(!codeLevel){
                    
                    (typeof(callback) === 'function') ? callback(data) : '';
                                    
                }else{
                        
                    hiApp.alert(codeLevel.message,function(){
                        if(codeLevel.path !== '/')
                            mainView.loadPage(codeLevel.path);

                        hiApp.hideIndicator();
                        hiApp.hidePreloader();
                    });
                }
            }
        });
        
    }
    return {
        simpleCall:simpleCall
    };
});
