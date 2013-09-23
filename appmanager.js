$(document).ready(function (){
	var score = 0;
	var crItem = -1; //current Item, -1 means no current item
	var quiz = new Quiz();
	
	function Quiz(title,items){
		this.title = title;
		this.items = items;
	}

	/* home pageEvent handler */
	$('#home').on('pagebeforehide',function(event,data){
		if(data.nextPage.attr("id") == 'addpage'){
			$("#titleField").val("");
		}
	});

		/** Home buttons event handlers **/
		$('#playButton').on('click', function(){
			$(this).attr('clicked','true');
			$('#editQuizButton').attr('clicked','false');
		});

		$('#editQuizButton').on('click', function(){
			$(this).attr('clicked','true');
			$('#playButton').attr('clicked','false');
		});

	/** edit pageEvent handler **/
	$('#editpage').on('pagebeforeshow',editQuiz);
		/*  editpage buttons */
		$('#addItemButton').on('click', function(){ toggle("additem"); });
		$('#saveQuizButton').on('click',saveQuiz);
		$('#deleteItemsButton').on('click',clearItems);
		$('#deleteQuizButton').on('click',deleteQuiz);
		/* add item buttons */
		$('#cancelAddItemButton').on('click',cancelAddItem);

	/** quiz pageEvent handler **/
	$('#quizpage').on('pagebeforeshow',restartQuiz);
	$('#finalAnswer').on('click',checkAnswer);
		/** navbar event handlers **/
		$('#restart').on('click',restartQuiz);

	/** selection pageEvent handler **/
	$('#selectionpage').on('pagebeforeshow',loadQuizzes);

	function loadQuizzes (){
		var listOpeningTag = ['<li data-theme="c"><a id="quizButton','" class="ui-link-inherit" href="#editpage" data-transition="slide">'];
        var spanOpeningTag = '<span class="ui-li-count ui-btn-up-c ui-btn-corner-all">';
        var closingTags = ' Items</span></a></li>';
        
        $('#quizList').html("");
		for (var i=0; i<localStorage.length; i++) {
			var key = localStorage.key(i);
			var q = JSON.parse(localStorage.getItem(key));

			var html = listOpeningTag[0]+(i+1)+listOpeningTag[1]+q.title+spanOpeningTag+q.items.length+closingTags;
			$('#quizList').append(html).listview("refresh");

			if($('#playButton').attr('clicked') == "true"){
				$('#quizButton'+(i+1)).attr('href','#quizpage');
			}
			$('#quizButton'+(i+1)).on('click',function (){				
				quiz = JSON.parse(localStorage.getItem($(this).text().replace($(this).find("span").text(),"")));
			})
		}
	}

	function placeOptions(){
		var exclude = new Array();
		while(exclude.length < 4){
			var index = Math.floor((Math.random())*4)+1;

			if(exclude.length == 0){
				$("label[for=\"radio"+index+"\"] span.ui-btn-text").text(quiz.items[crItem].answer);
				$('#radio'+index).val([quiz.items[crItem].answer]);
				exclude.push(index);		
			}
			else if(exclude.indexOf(index) === -1){
				$("label[for=\"radio"+index+"\"] span.ui-btn-text").text(quiz.items[crItem].option[exclude.length - 1]);
				$('#radio'+index).val(quiz.items[crItem].option[exclude.length - 1]);
				exclude.push(index);
			}			
		};
	}

	function checkAnswer(){
		//check if correct
		if($(':checked').parent().text().trim() == ""){
			alert("You need to pick an answer.");
		}
		else{
			if($(':checked').parent().text().trim() == quiz.items[crItem].answer){
			alert("Correct! Noice");
			score++;
			}
			else{
				alert("You answered wrong! Correct answer is "+quiz.items[crItem].answer);
			}
			//check if done
			crItem == quiz.items.length - 1 ? done() : nextItem();
		}
		
	}

	function nextItem(){
		crItem++;

		$('label[for="item"]').text('Question '+(crItem+1)+' of '+quiz.items.length);
		$('#question').text(quiz.items[crItem].question);
		placeOptions();

		$(':checked').attr( "checked", false );
			$('.optionsRadio').checkboxradio('refresh');
		
	}

	function restartQuiz(event){
		score = 0;
		crItem = -1;
		nextItem();
	}

	function done(){
		alert("DONE! You scored "+score+"/"+quiz.items.length);
		restartQuiz();
	}

	//localStorage.clear();

	/***** Quiz editing management *****/
	/***** 			***			   *****/
	/***** 			***			   *****/
	/***** 			***		       *****/
	/***** 			***			   *****/
	/***** 			***			   *****/
	/***** 		    ***			   *****/
	/***** 		***********		   *****/
	/***** 		  *******		   *****/
	/***** 		    ***		 	   *****/
	/***** 			 *			   *****/
	/***** Quiz editing management *****/

	function editQuiz(event, ui){
		if(ui.prevPage.attr('id') == "addpage")
			quiz = new Quiz($('#titleField').val(),[]);

		$('#quizTitleHeading').text(quiz.title);

		toggle('items');
		showItemButtons();
	}
	
	function saveItem(itemno){
		var fieldset = $('#saveItemButton').parent();
		if(!itemno){
			var item = new Item(
				$('#questionField').val(),
				$('#answerField').val(),
				[
					$('#choiceField1').val(),
					$('#choiceField2').val(),
					$('#choiceField3').val()
				]
			);

			if(!item.hasNull()){
				quiz.items.push(item);
				appendItemButton(quiz.items.length);
				toggle('items');
				$('#cantsave').hide();
			}
			else{
				$('#cantsave').show();
				$('#saveItemButton').one('click',function(){ saveItem(); });
			}
		}
		else {
			quiz.items[itemno-1].question = $('#questionField').val();
			quiz.items[itemno-1].answer = $('#answerField').val();
			for(var i = 1; i<=3 ; i++){
				quiz.items[itemno-1].option[i-1] = $('#choiceField'+i).val();
			}
			toggle('items');
		}
		
	}

	function saveQuiz(){
		if(!quiz.items.length == 0){
			var quizString = JSON.stringify(quiz);
			localStorage.setItem(quiz.title,quizString);
			$('#saveQuizButton').attr('href','#selectionpage');
		}
		else{
			alert('Save failed. Quiz must have atleast one question.');
			$('#saveQuizButton').attr('href','#');
		}
	}	

	function toggle(toShow,itemno){
		if(toShow == 'items'){
			if(quiz.items.length > 1){
				$('#editSubheading').text("Items");
				$('#editSubheading').show();
			}
			else if (quiz.items.length == 0){
				$('#editSubheading').hide();
			}
			else {	
				$('#editSubheading').show();
				$('#editSubheading').text("Item");
			}

			$('#editButtonsContainer').show();
			$('#itemButtons').show();
			$('#addFieldset').hide();
		}
		else{
			if(toShow == 'additem'){
				clearFields();
				$('#editSubheading').text("Add a new Item");
				$('#saveItemButton').one('click',function(){ saveItem(); });
			}
			else{
				$('#editSubheading').text("Edit Item "+itemno);
			}
			$('#editButtonsContainer').hide();

			$('#editSubheading').show();
			$('#itemButtons').hide();
			$('#addFieldset').show();
			$('#cantsave').hide();
		} 
	}

	function clearItems(){
		if(confirm('Are you sure you want to delete all quiz items?')){
			quiz.items = [];
			$('#editSubheading').hide();
			$('#itemButtons').text("");	
		}
	}	

	function deleteQuiz(){
		if(confirm('Are you sure you want to delete this quiz?')){
			localStorage.removeItem(quiz.title);
			quiz = {};
			$('#editSubheading').hide();
			$('#itemButtons').text("");
		}
	}
	
	function cancelAddItem(){
		toggle('items');
		$('#cantsave').hide();
		$('#saveItemButton').off();
	}

	function clearFields(){
		$('#questionField').val(''),
		$('#answerField').val('');
		$('#choiceField1').val('');
		$('#choiceField2').val('');
		$('#choiceField3').val('');
	}

	function showItemButtons(){
		$('#itemButtons').html("");
		for(var i = 1; i<=quiz.items.length ;i++){
			appendItemButton(i);
		}
	}

	function showItemInfo(itemno){
		$('#questionField').val(quiz.items[itemno-1].question),
		$('#answerField').val(quiz.items[itemno-1].answer);
		for(var i = 0; i < 3; i++)
			$('#choiceField'+(i+1)).val(quiz.items[itemno-1].option[i]);

		toggle('edititem',itemno);
	}

	function appendItemButton(itemno){
		var itemButtonOpeningTag = ['<a data-theme="c" id="itemButton','"data-wrapperels="span" data-iconshadow="true" data-shadow="true" data-corners="true" class="itemButton ui-btn ui-shadow ui-btn-corner-all ui-btn-inline ui-btn-up-c" data-role="button" data-inline="true" data-transition="pop" href="#"><span class="ui-btn-inner"><span class="ui-btn-text">'];
		var itemButtonClosingTag = '</span></span></a>';

		var itemButton = itemButtonOpeningTag[0]+(itemno)+itemButtonOpeningTag[1]+(itemno)+itemButtonClosingTag;
			
		$('#itemButtons').append(itemButton);
		$('#itemButton'+itemno).on('click',function(){ 
			showItemInfo(itemno); 
			$('#saveItemButton').one('click',function(){ saveItem(itemno) });
		})
	}

	function storeSampleQuizzes(){
		var sampleQuiz = '{"title":"Insect Trivia Quiz","items":[{"question":"These Insects have ears on their wings so they can avoid bats.","answer":"Night butterflies","option":["Dragonflies","Honeybees","Mosquitoes"]},{"question":"It can live up to 3 weeks without its head","answer":"Cockroach","option":["Mayfly","Monarch caterpillar","Mosquitoes"]},{"question":"The earliest fossil cockroach is about how many years old?","answer":"280 million","option":["100 million","65 million","160 million"]},{"question":"It is the only insect that can look behind its shoulders.","answer":"Praying mantis","option":["Ant","Caterpillar","Mayfly"]},{"question":"They have hair on their eyes","answer":"Honeybees","option":["House flies","Dragonflies","Desert locusts"]},{"question":"This creature can sleep for 3 years straight.","answer":"Snail","option":["Queen bee","Garden worm","Slug"]},{"question":"They shed their skin four times before they become a chrysalis, growing over 2700 times their original size.","answer":"Monarch caterpillars","option":["Mayflies","Cockroaches","Snake Ant"]}]}';
		
		localStorage.setItem("Insect Trivia Quiz",sampleQuiz);
	}
	storeSampleQuizzes();
});