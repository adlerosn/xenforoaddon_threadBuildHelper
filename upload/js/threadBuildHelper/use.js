//Polyfilling

if (!String.prototype.trim) { //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
	String.prototype.trim = function () {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};
}

if (!Array.prototype.swap) {
	Array.prototype.swap = function(a,b){
		//don't attempt to swap if indexes invalid
		if(Math.min(a,b)<0 || Math.max(a,b)>=this.length)
			return this;
		//indexes are valid, then swap
		var tmp = this[a];
		this[a] = this[b];
		this[b] = tmp;
		return this;
	}
}

if (!Array.prototype.remove) {
	Array.prototype.remove = function(a){
		//don't attempt to swap if index is invalid
		if(a<0 || a>=this.length)
			return undefined;
		//index is valid, then remove
		return this.splice(a, 1)[0];
	}
}

if (!Array.prototype.contains) {
	Array.prototype.contains = function(a){
		var ret = false
		this.forEach(function(elem){
			if(elem===a)
				ret = true;
		});
		return ret;
	}
}

if (!String.prototype.escapeHtml) { // http://stackoverflow.com/a/6234804
	String.prototype.escapeHtml = function () {
		return this
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	};
}

// End of Polyfilling

function escapeHtml(unsafe){ // http://stackoverflow.com/a/6234804
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function ensureArray(variable){
	if(
		variable !== null
		&&
		typeof(variable) === "object"
		&&
			(
			variable.constructor === Array
			||
				(
				variable.prop
				&&
				variable.prop.constructor === Array
				)
			)
	)
		return variable;
	else
		return new Array();
}

var threadPrefixesShown = [];
var threadPrefixesShownAssoc = {};
var threadPrefixesShownAssocInv = {};
var currentThreadPrefix = 0;
var threadPrefixListenerInitialized = false;
var threadPrefixListenerChanged = true;
var runningTBHPrefixId = 0;
var runningTBHStepId = 0;
var tbhIdUnpack = {};
var tbhStartIds = {};
var tbhIdQueue = [];
XenForo.EditorFramework = undefined;
XenForo.EditorArea = undefined;

function threadHelperUse_nextView(){
	var all = jQuery('input[type="radio"][name="'+runningTBHStepId+'"]');
	var ckd = jQuery('input[type="radio"][name="'+runningTBHStepId+'"]:checked');
	console.log('Thread Build Helper: Selected %s out of %s alternatives',ckd.length,all.length);
	if(ckd.length==all.length && all.length==0){
		console.log('Thread Build Helper: End of helper');
		tbhIdQueue = [];
		runningTBHPrefixId = 0;
		runningTBHStepId = 0;
		jQuery('#threadBuildHelper_container').children('#tbh_steps').empty();
		threadHelperUse_updateBtn();
		return;
	}
	if(ckd.length==0){
		return;
	}
	var selected = tbhIdUnpack[ckd[0].id];
	var appendInRedactor = '';
	var aborting = false;
	selected.segments.forEach(function(segment){
		if(['enqueueQuestionLast','enqueueQuestionNext','abort'].contains(segment.type)){
			if(segment.type=='abort'){
				aborting = true;
			}else
			if(segment.type=='enqueueQuestionLast'){
				tbhIdQueue.push(segment.data);
			}else
			if(segment.type=='enqueueQuestionNext'){
				tbhIdQueue.unshift(segment.data);
			}
		}else if(segment.type=='newLine'){
			appendInRedactor+='<br />';
		}else if(['emptyBoxS','emptyBoxM','emptyBoxL','emptyBoxF'].contains(segment.type)){
			var textBox = document.getElementById(segment.id);
			if(textBox!=null){
				appendInRedactor+=textBox.value.escapeHtml();
			}
		}else if(segment.type=='textStatic'){
			appendInRedactor+=segment.data;
		}
	});
	//console.log('Thread Build Helper, apending: %s', appendInRedactor);
	appendInRedactor+=' ';
	XenForo.EditorFramework.api.insertHtml(appendInRedactor);
	XenForo.EditorFramework.saveDraft();
	var next = "asfsdf";
	while(typeof(tbhIdUnpack[next])==='undefined'){
		next = tbhIdQueue.shift();
		if(typeof(next)==='undefined'){
			aborting = true;
			break;
		}
	}
	if(aborting){
		runningTBHStepId = "hoimfwnsvoirgm"; //break this thing
		return threadHelperUse_nextView(); //let it reset the environment
	}
	runningTBHStepId = next;
	threadHelperUse_renderView();
}

function threadHelperUse_renderView(){
	var step = tbhIdUnpack[runningTBHStepId];
	jQuery('#threadBuildHelper_container').children('#tbh_steps').css('display','none')
	if(runningTBHStepId<=0 || typeof(step)==='undefined'){
		return;
	}
	v='';
	v+='<span class="sectionMain" style="display: block;">'+step.question.escapeHtml()+'</span>';
	v+='<div class="xenForm">';
	v+='<dl class="ctrlUnit"><dt>';
	v+='Your reply:';
	v+='</dt><dd>';
	v+='<ul>'
	step.choices.forEach(function(choice){
		v+='<li><label>';
		v+='<input id="'+choice.id+'" type="radio" name="'+step.id+'"> ';
		v+=''
		choice.segments.forEach(function(segment){
			if(['enqueueQuestionLast','enqueueQuestionNext','abort'].contains(segment.type)){
				return;
			}
			if(['textStatic','comment'].contains(segment.type)){
				var isComment = segment.type=='comment';
				v+='<div id="'+segment.id+'" style="display: inline;'+(isComment?' opacity: 0.5; font-style: italic;':'')+'">';
				v+=isComment?'(':'';
				v+=segment.data;
				v+=isComment?')':'';
				v+='</div>';
			}else if(segment.type=='newLine'){
				v+=' \u21b5 <br />';
			}else if(['emptyBoxS','emptyBoxM','emptyBoxL','emptyBoxF'].contains(segment.type)){
				v+='<input class="textCtrl" type="text" style="width: 200px;" id="'+segment.id+'" placeholder="'+segment.data+'" />'
			}
			v+=' ';
		});
		v+='</label><li>';
	});
	v+='</ul>';
	v+='<p class="explain">';
	v+='Your reply will be added to the editor, building most of the text for you.';
	v+='</p>';
	v+='<div style="text-align: right;">';
	v+='<a class="button primary" onclick="threadHelperUse_nextView()" style="margin-top: 5px; margin-bottom: 15px;">';
	v+='Next question'.escapeHtml();
	v+='</a>';
	v+='</div>';
	v+='</dd></dl>';
	v+='</div>';
	jQuery('#threadBuildHelper_container').children('#tbh_steps').css('display','block').empty().html(v);
}

function threadHelperUse_init(){
	var editorContainer = document.getElementById('threadBuildHelper_container');
	jQuery(editorContainer).children('#tbh_js_disabled_notice').css('display','none');
	jQuery(editorContainer).children('#tbh_steps').css('display','none');
	jQuery(editorContainer).children('#tbh_control_btn').css('display','block');
	threadHelperUse_updateBtn();
	threadBuildHelper_tutorials.forEach(function(prefixTutorial,prefix_id){
		prefixTutorial = ensureArray(prefixTutorial);
		if(prefixTutorial.length>0){
			tbhStartIds[prefix_id]=prefixTutorial[0].id;
		}
		prefixTutorial.forEach(function(step){
			tbhIdUnpack[step.id]=step;
			step.choices.forEach(function(choice){
				tbhIdUnpack[choice.id]=choice;
				choice.segments.forEach(function(segment){
					tbhIdUnpack[segment.id]=segment;
				});
			});
		});
	});
}

function threadHelperUse_goToTutorial(){
	runningTBHPrefixId = currentThreadPrefix;
	threadHelperUse_updateBtn();
	var tutorialWindow = jQuery('#threadBuildHelper_container').children('#tbh_steps').css('display','block').empty();
	tbhIdQueue=[];
	runningTBHStepId = 0;
	runningTBHStepId = tbhStartIds[runningTBHPrefixId];
	threadHelperUse_renderView();
}

function threadHelperUse_updateBtn(){
	var label = '';
	var classes = ['button'];
	btn = jQuery('#threadBuildHelper_container').children('#tbh_control_btn').children('a');
	if(runningTBHPrefixId==0){
		label+='Start';
	}
	else if (runningTBHPrefixId==currentThreadPrefix){
		label+='Restart';
	}
	else if (runningTBHPrefixId!=0){
		label+='Change to';
	}
	label+=' helper for prefix "'+threadPrefixesShownAssoc[currentThreadPrefix]+'"';
	btn.off();
	if(currentThreadPrefix==0){
		label = 'No helper available for unprefixed threads';
		btn.css('display','none');
		btn.attr('disabled','disabled');
	}
	else if(typeof(tbhStartIds[currentThreadPrefix])==='undefined'){
		label = 'No helper available for selected thread prefix';
		btn.css('display','none');
		btn.attr('disabled','disabled');
	}else{
		if(runningTBHPrefixId!=currentThreadPrefix){
			classes.push('primary');
		}
		btn.on('click',threadHelperUse_goToTutorial);
		btn.removeAttr('disabled');
		btn.css('display','block');
	}
	btn.empty().append(label.escapeHtml());
	btn.attr('class',classes.join(' '));
}

function updateCurrentThreadPrefix(){
	threadPrefixListenerChanged = true;
	var node = jQuery('span.PopupControl.prefix[rel=Menu]')[0];
	if(typeof(node)==='undefined'){
		console.info('Thread Build Helper: Thread prefix id changed, but DOM structure cannot be accessed right now... delaying 50ms');
		setTimeout(updateCurrentThreadPrefix,50);
	}
	else{
		var previousThreadPrefix = currentThreadPrefix;
		var newThreadPrefix = threadPrefixesShownAssocInv[node.innerText.trim()];
		if(typeof(newThreadPrefix)==='undefined'){
			console.info('Thread Build Helper: Thread prefix id changed, but to an unknown id... delaying 50ms');
			setTimeout(updateCurrentThreadPrefix,50);
		}else{
			currentThreadPrefix = newThreadPrefix;
			if(newThreadPrefix!=previousThreadPrefix){
				threadPrefixListenerChanged = false;
				console.info('Thread Build Helper: Thread prefix id changed from %s to %s',previousThreadPrefix,currentThreadPrefix);
				var editorContainer = document.getElementById('threadBuildHelper_container');
				threadHelperUse_updateBtn();
			}
		}
	}
}

function threadHelperUse_environmentContextInit(){
	var prefixesSelector = document.getElementById('ctrl_prefix_id_thread_create');
	var menuSelector = jQuery('span.PopupControl.prefix[rel=Menu]')[0];
	threadPrefixesShown = [];
	threadPrefixesShownAssoc = {};
	threadPrefixesShownAssocInv = {};
	jQuery(prefixesSelector).children('optgroup').children('option').add(jQuery(prefixesSelector).children('option')).each(function(index,element){
		threadPrefixesShown.push(element.value.trim());
		threadPrefixesShownAssoc[element.value.trim()]=element.innerText.trim();
		threadPrefixesShownAssocInv[element.innerText.trim()]=element.value.trim();
	});
	if(!threadPrefixListenerInitialized){
		threadPrefixListenerInitialized = true;
		if(typeof(MutationObserver)==='undefined'){
			//Older standard, deprecated on newer versions; here just for compatibility
			menuSelector.addEventListener('DOMSubtreeModified',updateCurrentThreadPrefix);
		}else{
			//Newer standard, may not be implemented on older brosers
			var mu = new MutationObserver(updateCurrentThreadPrefix);
			mu.observe(menuSelector,{'attributes':true});
		}
		setTimeout(updateCurrentThreadPrefix,5);
	}
}

function threadHelperUse_preInit(jQuery,_undefined){
	var editorContainer = document.getElementById('threadBuildHelper_container');
	var prefixesSelector = document.getElementById('ctrl_prefix_id_thread_create');
	var prefixMenu = document.getElementsByClassName('PrefixMenu')[0];
	var menuSelector = jQuery('span.PopupControl.prefix[rel=Menu]')[0];
	if (editorContainer != null){
		jQuery(editorContainer).children('#tbh_js_disabled_notice').css('display','none');
		jQuery(editorContainer).children('#tbh_steps').css('display','none');
		jQuery(editorContainer).children('#tbh_control_btn').css('display','none');
	}
	if (
		editorContainer == null
		||
		prefixesSelector == null
		||
		typeof(prefixMenu)==="undefined"
		||
		typeof(menuSelector)==="undefined"
		||
		typeof(threadBuildHelper_tutorials)==="undefined"
	){
		return setTimeout(function(){threadHelperUse_preInit(jQuery,_undefined);},250);
	}else{
		threadHelperUse_environmentContextInit();
		return threadHelperUse_init();
	}
}

!function(jQuery,_undefined){
	return threadHelperUse_preInit(jQuery,_undefined);
}(jQuery);

!function($, window, document, undefined){
	$(document).on('EditorInit', function(e, data){
		XenForo.EditorFramework = data['editor'];
		XenForo.EditorArea = data['$textarea'];
		console.info('Thread Build Helper got the Editor Framework');
	});
}(jQuery, this, document, 'undefined');

