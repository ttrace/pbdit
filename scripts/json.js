/*
================================================================================
    Name        :   JSON
    In          :   [none]      
    Out         :   [none]      
    Note        :   JSONユーティリティ群
--------------------------------------------------------------------------------
    Version     :   Ver1.0.0    |   2006/12/04  |   新規作成
--------------------------------------------------------------------------------
    License     :   New BSD license
    URL         :   www.kanasansoft.com
================================================================================
*/

/*--------------------------------------------------------------------------------
    コンストラクタ
--------------------------------------------------------------------------------*/
function JSON(){
}

/*--------------------------------------------------------------------------------
    JSONエンコードを行なう
--------------------------------------------------------------------------------*/
function JSONEncode(obj)
{
    var rtn;

    if(obj==null){

        rtn = "null";
		window.console.log('null');
    }else{

 //        switch(obj.constructor){
// 
//             case Boolean:
//                 rtn = obj?"true":"false";
//                 break;
// 
//             case Number:
//                 rtn = isNaN(obj)||!isFinite(obj)?"null":obj.toString(10);
//                 break;
// 
//             case String:
//                 rtn = "\""+StringUtility.Encode.JavaScript(obj)+"\"";
//                 break;
// 
//             case Array:
//                 var buf = [];
//                 for(var i=0;i<obj.length;i++){
//                     //再帰呼出
//                     buf.push(arguments.callee(obj[i]));
//                 }
//                 rtn = "["+buf.join(",")+"]";
//                 break;
// 
//             case Object:
                var buf = [];
                for(var key in obj){
                    //Object汚染回避判定有
                    if(obj.hasOwnProperty(key)){
                        //再帰呼出
                        buf[buf.length] = arguments.callee(key)+":"+arguments.callee(obj[key]);
                    }
                }
                rtn = "{"+buf.join(",")+"}";
//                 break;
// 
//             default:
//                 rtn = "null";
// 		window.console.log('null');
//                 break;
// 
//        }

    }

    return rtn;
}

/*--------------------------------------------------------------------------------
    JSONデコードを行なう
--------------------------------------------------------------------------------*/
JSON.Decode
=   function(str){

    var rtn;

    eval("rtn="+str);

    return rtn;
}