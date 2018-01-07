<?php

class threadBuildHelper_adminOptionThreadHelperEditor {
	public static function renderView(XenForo_View $view, $fieldPrefix, array $preparedOption, $canEdit){
		
		$threadPrefixModel = XenForo_Model::create('XenForo_Model_ThreadPrefix');
		//$forumNodes = XenForo_Model::create('XenForo_Model_Forum')->getForums();
		$threadPrefixes = $threadPrefixModel->getPrefixes([],['order'=>'canonical_order']);
		foreach($threadPrefixes as &$tp){
			$tp['title_phrase'] = $threadPrefixModel->getPrefixTitlePhraseName($tp['prefix_id']);
			$tp['title'] = (new XenForo_Phrase($tp['title_phrase']))->__toString();
			$tp['group_title_phrase'] = $threadPrefixModel->getPrefixGroupTitlePhraseName($tp['prefix_group_id']);
			$tp['group_title'] = (new XenForo_Phrase($tp['group_title_phrase']))->__toString();
			//$tp = ['title'=>$tp['title']];
		}
		
		/*
		homeOrServer_DownloadHelper::sendAsDownload(
		json_encode(
		//$fn
		$threadPrefixes
		,JSON_PRETTY_PRINT)
		,'a','',false);
		//*/
		
		$editLink = $view->createTemplateObject('option_list_option_editlink', array(
			'preparedOption' => $preparedOption,
			'canEditOptionDefinition' => $canEdit
		));
		return $view->createTemplateObject('kiror_option_template_tbh_mainBuilder', array(
			'fieldPrefix' => $fieldPrefix,
			'listedFieldName' => $fieldPrefix . '_listed[]',
			'preparedOption' => $preparedOption,
			'formatParams' => $preparedOption['formatParams'],
			'editLink' => $editLink,
			
			'optionValue' => $preparedOption['option_value'],
			'threadPrefixes' => $threadPrefixes,
		));
	}
	
	public static function validate(&$field, XenForo_DataWriter $dw, $fieldName){
		$field = json_encode(json_decode($field));
		if($field==='null'){
			$field='[]';
		}
		/*
		homeOrServer_DownloadHelper::sendAsDownload(
		json_encode(
		$field
		,JSON_PRETTY_PRINT)
		,'a','',false);
		//*/
		
		return true;
	}
}
