    document.body.style.height = document.documentElement.clientHeight - 100 + "px";

    var fm = new FloatModule({
        animation:'spring-in',
		theme_color:'#ff832a',
		theme_content_color:'#fff',
		margin_li:'0px',
		draggable:true,
        btn_config:[{
            icon:'fa fa-share-alt',
			title:'我是可以拖动的哦！',
			click: fnTest
        },{
            icon:'fa fa-weibo',
            title:'分享到微博',
            click: fnTest,
        },{
            icon:'fa fa-wechat',
            title:'分享到微信',
            click: fnTest
        },{
            icon:'fa fa-qq',
            title:'分享到qq',
            click: fnTest
        }]
    });

    function fnTest() {
        alert("我是可以拖动的哦！");
    }

    function fnClickStep() {
        var index = event.currentTarget.getAttribute("index");
        var steps = document.getElementsByClassName("step");
        var contents = document.getElementsByClassName("step-content");
        for (var i=0; i<contents.length; i++) {
            if (i == index) {
                contents[i].style.display = "block";
                steps[i].classList.add("step-active");
            } else {
                contents[i].style.display = "none";
                steps[i].classList.remove("step-active");
            }
        }
    }
