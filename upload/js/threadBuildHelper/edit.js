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

Array.prototype.remove = function(a){
	//don't attempt to swap if index is invalid
	if(a<0 || a>=this.length)
		return undefined;
	//index is valid, then remove
	return this.splice(a, 1)[0];
}

Array.prototype.contains = function(a){
	var ret = false
	this.forEach(function(elem){
		if(elem===a)
			ret = true;
	});
	return ret;
}

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

function lengthLessList2Array(subj,start){
	posConv = Array();
	for(var i = start; typeof(subj[i])!=='undefined'; i++){
		posConv.push(subj[i]);
	}
	return posConv;
}

function getTimeBasedId(){
	return (new Date()).getTime().toString();
}

var segmentsTypesAvailable=[
	['comment','Comment'],
	['textStatic','Static text'],
	['newLine','New Line'],
	['emptyBoxS','Empty textbox small'],
	['emptyBoxM','Empty textbox medium'],
	['emptyBoxL','Empty textbox large'],
	['emptyBoxF','Empty textbox full width'],
	['enqueueQuestionLast','Enqueue as last question'],
	['enqueueQuestionNext','Enqueue as next question'],
	['abort','Close the helper']
];

var segmentsTypesKeyed = {};
segmentsTypesAvailable.forEach(function(segmentType){segmentsTypesKeyed[segmentType[0]]=segmentType[1];});

var redirectableSegmentsTypes = [
	'enqueueQuestionLast',
	'enqueueQuestionNext'
];

var noDataSegmentsTypes = [
	'abort',
	'newLine'
];

function threadHelperEditor_step_add(prefixndx){
	var threadPrefixes = lengthLessList2Array(threadHelperEditor_threadPrefixes,1);
	var dataField = document.getElementById('threadHelperEditorData');
	var data = JSON.parse(dataField.value);
	//unpacking data
	var prefix = threadPrefixes[prefixndx];
	var steps = ensureArray(data[prefix.prefix_id]);
	//changing data
	steps.push({'id':getTimeBasedId(),'question':'','choices':[]});
	//repacking data
	data[prefix.prefix_id] = steps;
	dataField.value = JSON.stringify(data);
	//update view
	threadHelperEditor_init();
}

function threadHelperEditor_step_move(prefix_index,step_index,direction){
	var threadPrefixes = lengthLessList2Array(threadHelperEditor_threadPrefixes,1);
	var dataField = document.getElementById('threadHelperEditorData');
	var data = JSON.parse(dataField.value);
	//unpacking data
	var prefix = threadPrefixes[prefix_index];
	var steps = data[prefix.prefix_id];
	//changing data
	if(direction=='trash'){
		steps.remove(step_index);
	}else if(direction=='up' || direction=='down'){
		var one = step_index;
		var another = undefined;
		if(direction=='up'){
			another = one-1;
		}else{
			another = one+1;
		}
		steps.swap(one,another)
	}
	//repacking data
	data[prefix.prefix_id] = steps;
	dataField.value = JSON.stringify(data);
	//update view
	threadHelperEditor_init();
}

function threadHelperEditor_step_questionSave(prefix_index,step_index,question_string){
	var threadPrefixes = lengthLessList2Array(threadHelperEditor_threadPrefixes,1);
	var dataField = document.getElementById('threadHelperEditorData');
	var data = JSON.parse(dataField.value);
	//unpacking data
	var prefix = threadPrefixes[prefix_index];
	var steps = data[prefix.prefix_id];
	var step = steps[step_index];
	//checking data
	if(step.question!=question_string){
		//updating data
		step.question = question_string;
		//repacking data
		steps[step_index] = step;
		data[prefix.prefix_id] = steps;
		dataField.value = JSON.stringify(data);
	}
}

function threadHelperEditor_choice_add(prefix_index,step_index){
	var threadPrefixes = lengthLessList2Array(threadHelperEditor_threadPrefixes,1);
	var dataField = document.getElementById('threadHelperEditorData');
	var data = JSON.parse(dataField.value);
	//unpacking data
	var prefix = threadPrefixes[prefix_index];
	var steps = data[prefix.prefix_id];
	var step = steps[step_index];
	var choices = step.choices;
	//modifying data
	choices.push({'id':getTimeBasedId(),'segments':[]});
	//repacking data
	step.choices = choices;
	steps[step_index] = step;
	data[prefix.prefix_id] = steps;
	dataField.value = JSON.stringify(data);
	//update view
	threadHelperEditor_init();
}

function threadHelperEditor_choice_move(prefix_index,step_index,choice_index,direction){
	var threadPrefixes = lengthLessList2Array(threadHelperEditor_threadPrefixes,1);
	var dataField = document.getElementById('threadHelperEditorData');
	var data = JSON.parse(dataField.value);
	//unpacking data
	var prefix = threadPrefixes[prefix_index];
	var steps = data[prefix.prefix_id];
	var step = steps[step_index];
	var choices = step.choices;
	//modifying data
	if(direction=='trash'){
		choices.remove(choice_index);
	}else if(direction=='up' || direction=='down'){
		var one = choice_index;
		var another = undefined;
		if(direction=='up'){
			another = one-1;
		}else{
			another = one+1;
		}
		choices.swap(one,another);
	}
	//repacking data
	step.choices = choices;
	steps[step_index] = step;
	data[prefix.prefix_id] = steps;
	dataField.value = JSON.stringify(data);
	//update view
	threadHelperEditor_init();
}

function threadHelperEditor_segment_add(prefix_index,step_index,choice_index,type){
	var threadPrefixes = lengthLessList2Array(threadHelperEditor_threadPrefixes,1);
	var dataField = document.getElementById('threadHelperEditorData');
	var data = JSON.parse(dataField.value);
	//unpacking data
	var prefix = threadPrefixes[prefix_index];
	var steps = data[prefix.prefix_id];
	var step = steps[step_index];
	var choices = step.choices;
	var choice = choices[choice_index];
	//modifying data
	if(type.length>0){
		choice.segments.push({'id':getTimeBasedId(),'type':type,'data':''});
	}
	//repacking data
	choices[choice_index] = choice;
	step.choices = choices;
	steps[step_index] = step;
	data[prefix.prefix_id] = steps;
	dataField.value = JSON.stringify(data);
	//update view
	threadHelperEditor_init();
}

function threadHelperEditor_segment_move(prefix_index,step_index,choice_index,segment_index,direction){
	var threadPrefixes = lengthLessList2Array(threadHelperEditor_threadPrefixes,1);
	var dataField = document.getElementById('threadHelperEditorData');
	var data = JSON.parse(dataField.value);
	//unpacking data
	var prefix = threadPrefixes[prefix_index];
	var steps = data[prefix.prefix_id];
	var step = steps[step_index];
	var choices = step.choices;
	var choice = choices[choice_index];
	//modifying data
	if(direction=='trash'){
		choice.segments.remove(segment_index);
	}else if(direction=='up' || direction=='down'){
		var one = segment_index;
		var another = undefined;
		if(direction=='up'){
			another = one-1;
		}else{
			another = one+1;
		}
		choice.segments.swap(one,another);
	}
	//repacking data
	choices[choice_index] = choice;
	step.choices = choices;
	steps[step_index] = step;
	data[prefix.prefix_id] = steps;
	dataField.value = JSON.stringify(data);
	//update view
	threadHelperEditor_init();
}

function threadHelperEditor_segment_edit(prefix_index,step_index,choice_index,segment_index,field_data){
	var threadPrefixes = lengthLessList2Array(threadHelperEditor_threadPrefixes,1);
	var dataField = document.getElementById('threadHelperEditorData');
	var data = JSON.parse(dataField.value);
	//unpacking data
	var prefix = threadPrefixes[prefix_index];
	var steps = data[prefix.prefix_id];
	var step = steps[step_index];
	var choices = step.choices;
	var choice = choices[choice_index];
	var segment = choice.segments[segment_index];
	//modifying data
	var updateView = redirectableSegmentsTypes.contains(segment.type);
	segment['data'] = field_data;
	//repacking data
	choice.segments[segment_index] = segment;
	choices[choice_index] = choice;
	step.choices = choices;
	steps[step_index] = step;
	data[prefix.prefix_id] = steps;
	dataField.value = JSON.stringify(data);
	//update view
	if(updateView){
		threadHelperEditor_init();
	}
}

function threadHelperEditor_init(_undefined){
	var threadPrefixes = lengthLessList2Array(threadHelperEditor_threadPrefixes,1);
	var dataField = document.getElementById('threadHelperEditorData');
	var editorContainer = document.getElementById('threadHelperEditor');
	var data = JSON.parse(dataField.value);
	var v = '';
	v+='<div style="border-bottom: 1px solid #a5cae4; margin-bottom: 10px; padding-bottom: 5px;">';
	v+='<a class="button" onclick="threadHelperEditor_init()">Re-render view</a>';
	v+='</div>';
	threadPrefixes.forEach(function(prefix,prefix_index){
		v+='<div style="border-bottom: 1px solid #a5cae4; margin-bottom: 3.5px; padding-bottom: 3.5px; margin-top: 10px;">';
		v+='<div>';
		v+='<span class="prefix prefixRed" style="background-color: #EEEEEE; color: #000000; border-color: #DDDDDD;">'+prefix['group_title']+'</span>';
		v+=' ';
		v+='<span class="'+prefix['css_class']+'">'+prefix['title']+'</span>';
		v+='</div>';
		v+='<div id="prefix_'+prefix['prefix_id']+'" class="sectionMain" style="padding-top: 5px;">';
			var availableSteps = [];
			var availableStepsAssoc = {};
			ensureArray(data[prefix['prefix_id']]).forEach(function(step,step_index){
				availableSteps.push(step.id);
				availableStepsAssoc[step.id]=step;
			});
			ensureArray(data[prefix['prefix_id']]).forEach(function(step,step_index){
				v+='<div class="sectionMain">';
				v+='<span style="display: block;">';
					v+='<a class="button" onclick="threadHelperEditor_step_move('+prefix_index+','+step_index+',\'up\')">\u25b2</a>'+' ';
					v+='<a class="button" onclick="threadHelperEditor_step_move('+prefix_index+','+step_index+',\'down\')">\u25bc</a>'+' ';
					v+='<a class="button" onclick="threadHelperEditor_step_move('+prefix_index+','+step_index+',\'trash\')">\u2716</a>'+' ';
				v+='Step #'+step_index+' (id:'+step.id+')';
				v+='</span>';
				v+='<div class="sectionMain" style="border-color: #d7edfc;">';
					v+='Question:';
					v+='<input type="textbox" class="textCtrl" onkeyup="threadHelperEditor_step_questionSave('+prefix_index+','+step_index+',this.value)" value="'+escapeHtml(step.question)+'"></input>';
				v+='</div>';
				v+='<div class="sectionMain" style="border-color: #d7edfc;">';
					v+='<span style="display: block;">Choices:</span>';
					step.choices.forEach(function(choice,choice_index){
						v+='<div class="sectionMain">';
						v+='<span style="display: block;">';
							v+='<a class="button" onclick="threadHelperEditor_choice_move('+prefix_index+','+step_index+','+choice_index+',\'up\')">\u25b2</a>'+' ';
							v+='<a class="button" onclick="threadHelperEditor_choice_move('+prefix_index+','+step_index+','+choice_index+',\'down\')">\u25bc</a>'+' ';
							v+='<a class="button" onclick="threadHelperEditor_choice_move('+prefix_index+','+step_index+','+choice_index+',\'trash\')">\u2716</a>'+' ';
						v+='Choice #'+choice_index+' (id:'+choice.id+')';
						v+='</span>';
						choice.segments.forEach(function(segment,segment_index){
							v+='<div class="sectionMain" style="border-color: #d7edfc;">';
							v+='<span style="display: block;">';
								v+='<a class="button" onclick="threadHelperEditor_segment_move('+prefix_index+','+step_index+','+choice_index+','+segment_index+',\'up\')">\u25b2</a>'+' ';
								v+='<a class="button" onclick="threadHelperEditor_segment_move('+prefix_index+','+step_index+','+choice_index+','+segment_index+',\'down\')">\u25bc</a>'+' ';
								v+='<a class="button" onclick="threadHelperEditor_segment_move('+prefix_index+','+step_index+','+choice_index+','+segment_index+',\'trash\')">\u2716</a>'+' ';
							v+='Segment #'+segment_index+' (id:'+segment.id+') - '+segmentsTypesKeyed[segment.type];
							v+='</span>';
							v+='<span style="display: block;">';
							if(redirectableSegmentsTypes.contains(segment.type)){
								if(segment.data.length==0){
									setTimeout('threadHelperEditor_segment_edit('+prefix_index+','+step_index+','+choice_index+','+segment_index+','+step.id+')',50);
								}
								v+='<select class="textCtrl" onchange="threadHelperEditor_segment_edit('+prefix_index+','+step_index+','+choice_index+','+segment_index+',this.value)"'+((segment.data==step.id)?' style="background-color: #ffc8c8;"':'')+'>';
								availableSteps.forEach(function(step_id_redir){
									v+='<option value="'+step_id_redir+'" style="background-color: '+((step_id_redir==step.id)?'#ffc8c8':'#ffffff')+';"'+((step_id_redir==segment.data)?' selected':'')+'>'+step_id_redir+' - '+escapeHtml(availableStepsAssoc[step_id_redir].question)+'</option>';
								});
								v+='</select>';
							}else if(noDataSegmentsTypes.contains(segment.type)){
								v+='';
							}else{
								v+='<input type="text" onkeyup="threadHelperEditor_segment_edit('+prefix_index+','+step_index+','+choice_index+','+segment_index+',this.value)"  class="textCtrl" value="'+escapeHtml(segment.data)+'">';
								v+='</input>';
							}
							v+='</span>';
							v+='</div>';
						});
						v+='<span style="display: block;">';
						v+='<select class="textCtrl" onchange="threadHelperEditor_segment_add('+prefix_index+','+step_index+','+choice_index+',this.value)">';
							v+='<option value="" selected>Add segment</option>';
							segmentsTypesAvailable.forEach(function(segmentType){
								v+='<option value="'+escapeHtml(segmentType[0])+'">'+escapeHtml(segmentType[1])+'</option>';
							});
						v+='</select>';
						v+='</span>';
						v+='</div>';
					});
					v+='<span style="display: block;"><a class="button" onclick="threadHelperEditor_choice_add('+prefix_index+','+step_index+')">Add choice</a></span>'
				v+='</div>';
				v+='</div>';
			});
			v+='<a class="button" onclick="threadHelperEditor_step_add('+prefix_index+')">Add new step</a>';
		v+='</div>';
		v+='</div>';
	});
	editorContainer.innerHTML=v;
	//console.log(jQuery,threadPrefixes,data,dataField,editorContainer);
}

function threadHelperEditor_preInit(jQuery,threadPrefixes,_undefined){
	var dataField = document.getElementById('threadHelperEditorData');
	var editorContainer = document.getElementById('threadHelperEditor');
	if (dataField == null || editorContainer == null || typeof(threadHelperEditor_threadPrefixes)==="undefined"){
		return setTimeout(function(){threadHelperEditor_preInit(jQuery,threadPrefixes,_undefined);},100);
	}else{
		dataField.type = 'hidden';
		return threadHelperEditor_init();
	}
}

!function(jQuery,threadPrefixes,_undefined){
	return threadHelperEditor_preInit(jQuery,threadPrefixes,_undefined);
}(jQuery);
