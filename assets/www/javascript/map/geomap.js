	String.prototype.format = function() { a = this; for ( k in arguments ) { a = a.replace("{" + k + "}", arguments[k]); } return a; };
	window.geomap = { 
		'version': '3.0-rc1',
		'ga': '',
		'primaryUrl': 'http://code.google.com/p/jquery-ui-map/',
		'url': 'http://jquery-ui-map.googlecode.com/', 
		'forum': 'http://groups.google.com/group/jquery-ui-map-discuss/feed/rss_v2_0_msgs.xml', 
		'subscribe': 'http://groups.google.com/group/jquery-ui-map-discuss/boxsubscribe', 
		'exception': 'Unable to load due to either poor internet connection or some CDN\'s aren\'t as responsive as we would like them to be. Try refreshing the page :D.', 
		'init': function() {
			window._gaq = [['_setAccount', this.ga], ['_trackPageview'], ['_trackPageLoadTime']];
			//Modernizr.load({ 'test': ( location.href.indexOf(this.url) > -1 ), 'yep': 'http://www.google-analytics.com/ga.js' });
			this.test('Backbone', function() {
				$('#forum').append('<h2>Forum</h2><ul id="forum_posts"></ul><h2>Subscribe</h2><form id="forum_subscribe" class="subscribe" action="#"><label for="email">E-mail:</label><input id="email" type="text" name="email" /><input type="submit" name="sub" value="Subscribe" /></form>');
				ForumCollection = Backbone.Collection.extend({ 'url': 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q={0}'.format(encodeURIComponent(geomap.forum)), 'parse': function(response) { if(response.responseData!=null) return response.responseData.feed.entries; else return null;} });
				ForumPost = Backbone.View.extend({ 'tagName': 'li', 'className': 'group-item', 'template': _.template('<a href="<%=link%>"><%=title%></a></h3>'), 'render': function() { $(this.el).html(this.template(this.model.toJSON())); return this; } }); 
				Forum = Backbone.View.extend({ 'el': $("#forum"), 'initialize': function() { this.col = new ForumCollection(); this.col.bind('reset', this.load, this); this.col.fetch(); }, 'add': function(post) { var view = new ForumPost({'model': post}); $('#forum_posts').append(view.render().el); }, 'load': function () { this.col.each(this.add); $('#forum_subscribe').attr('action', geomap.subscribe); $(this.el).show(); } });
				var app = new Forum();
			});
			this.test('prettyPrint', function() { prettyPrint(); });
			$('#version').text(this.version);
		},
		'redirect': function(url) { alert('This page is deprecated. Please update your URL. Redirecting to new page.'); window.location = url; },
		'col': [], 
		'tests': [],
		'test': function(a, b) { if ( window[a] ) { b(); } },
		'add': function(a, b) { if (b) { this.col[a] = b; } else { this.col.push(a); } return this; },
		'load': function(a) { var self = this; if (a) { self.col[a](); } else { $.each(self.col, function(i,d) { try { d(); } catch (err) { alert(self.exception); } }); } },
		'timeStart': function(key, desc) { this.tests[key] = { 'start': new Date().getTime(), 'desc': desc }; },
		'timeEnd': function(key) { this.tests[key].elapsed = new Date().getTime(); },
		'report': function(id) { var i = 1; for ( var k in this.tests ) { var t = this.tests[k]; $(id).append('<div class="benchmark rounded"><div class="benchmark-result lt">' + (t.elapsed - t.start) + ' ms</div><div class="lt"><p class="benchmark-iteration">Benchmark case ' + i + '</p><p class="benchmark-title">' + t.desc + '</p></div></div>'); i++; }; }
	};
		
	geomap.init();
	
	$(function() {
		geomap.add(function() {
//			'disableDefaultUI':true, --> to disable the ui include this in the below gmap
			$('#map_canvas').gmap({  'callback': function(map) {
				var creator = new PolygonCreator(map);
				//reset
				 $('#reset').click(function(){ 
				 		creator.destroy();
				 		creator=null;
				 		$('#dataPanel').empty();
				 		creator=new PolygonCreator(map);
				 });		 
				 //show paths
				 $('#showData').click(function(){
				 		$('#dataPanel').empty();
				 		if(null==creator.showData()){
				 			$('#dataPanel').append('Please first create a polygon');
				 		}else{
				 			$('#dataPanel').append(creator.showData());
				 		}
				 });	
				//save to db
				 $('#savePolygon').click(function(){
				 		if(null==creator.showData()){
				 			$('#dataPanel').append('Please first create a polygon');
				 		}else{
				 			var polygonPoints=creator.showData();
				 			savePolygonPoints(polygonPoints);
				 		}
				 });
			}});
		}).load();
	});
	
	function savePolygonPoints(polygonPoints)
	{
		$('#msgModal').modal('show');
		$("#msg-header-span").attr('class',"label label-info").text("info!");
		$("#modal-message").attr('class',"label label-info").text("  Saving polygon points...!");
		$("#schedulestatusicon").remove();
		$("#msgfooterbtn").prepend('<i class="icon-white icon-time" id="schedulestatusicon"></i>');
		$("#msgfooterbtn").attr('class','btn btn-info');
		
		var url = urlForServer+"map/savePolygonPoints/"+loginUserId;
		$.support.cors = true;
		var datastr = polygonPoints;
		var params = encodeURIComponent(datastr);
		$.ajax({
			type : 'POST', url : url, data : params,
			success : function(responseText) {
				console.log("<-------Save polygon points received with response as -------> "+ responseText);
				var data=jQuery.parseJSON(responseText);
				var message = data['message'];
				if(message!=null && message!='Success')
				{
					$("#msg-header-span").attr('class',"label label-warning").text("info");
					$("#modal-message").attr('class',"label label-warning").text("  Error in saving polygon points...!");
					$("#schedulestatusicon").remove();
					$("#msgfooterbtn").prepend('<i class="icon-white icon-remove" id="schedulestatusicon"></i>');
					$("#msgfooterbtn").attr('class','btn btn-warning');
					setTimeout(function(){
						$('#msgModal').modal('hide');	
					},5000);
				}
				else
				{
					$("#msg-header-span").attr('class',"label label-success").text("info");
					$("#modal-message").attr('class',"label label-success").text("  Polygon points saved successfully...!");
					$("#schedulestatusicon").remove();
					$("#msgfooterbtn").prepend('<i class="icon-white icon-ok" id="schedulestatusicon"></i>');
					$("#msgfooterbtn").attr('class','btn btn-success');
					setTimeout(function(){
						$('#msgModal').modal('hide');	
					},5000);
				}
			},
			error : function(jqXHR, textStatus, errorThrown) 
			{
				console.error(textStatus, errorThrown);
				console.error("<-------Error returned saving polygon points-------> ");
			}
		});
	}