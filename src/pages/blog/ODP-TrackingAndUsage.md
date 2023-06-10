---
layout: '../../layouts/BlogPost.astro'
title: Optimizely Data Platform (ODP) - Tracking and Usage Examples
pubDate: 14 Jan 2022
description: Get started with ODP
heroImage: /assets/blog/ODP-TrackingAndUsage/odp.png
---

The goal of this post is to provide some examples of working with [Optimizely Data Platform (ODP)](https://www.optimizely.com/products/intelligence/data-platform/) with [Optimizely Content Cloud](https://www.optimizely.com/products/content/) and [Commerce Cloud](https://www.optimizely.com/products/commerce/b2c/). Note that, while focused on those platforms using our [Foundation reference implementation](https://github.com/episerver/Foundation), the overall strategies can be used for tracking on any solution.

Rather than recreate the wheel, for a great starting point please reference David Knipe's blog post ["Adding Optimizely Data Platform to Optimizely Commerce Cloud"](https://www.david-tec.com/2021/05/adding-optimizely-data-platform-to-optimizely-commerce-cloud/). It provides a very solid base on which to build, and allows us to go straight into other tracking examples and how you might use the data in ODP itself. One key step from that blog post you must complete is to add the standard JavaScript tracking script for ODP to your site, to enable pageview and customer tracking. The script can be found by going to the ODP "Integrations" admin screen, and clicking into the "JavaScript Tag" integration -- refer to the [ODP JavaScript tag documentation here](https://docs.zaius.com/hc/en-us/articles/360033327194-Install-the-Zaius-JavaScript-tag) for more details.

Now, let's get into some custom event tracking.

## Optimizely Forms Events

### ODP Prep

First you'll need to create a new field in ODP. Log in to ODP, then go to account settings by clicking the gear icon in the top-right of the page.

![](https://blog.danisaacs.net/content/images/2022/01/adding_field-01.png)

Then select "Create New Field" to create the new property -- I used the following values (the "field name" will be used in the tracking section below):

![](https://blog.danisaacs.net/content/images/2022/01/adding_field-02.png)

### Tracking

The example tracking below for Optimizely Forms leverages the available 
[Forms client-side events](https://world.optimizely.com/documentation/developer-guides/forms/handling-events-for-forms/) to track form impressions and form submissions. Alternatively, form submission tracking could be done server-side by modifying it to use the .NET events documented on that page.

    // ODP Tracking for Optimizely Forms
    
    if (typeof $$epiforms !== 'undefined') {
        $$epiforms(document).ready(function myfunction() {
            $$epiforms(".EPiServerForms").on("formsNavigationNextStep formsNavigationPrevStep formsSetupCompleted formsReset formsStartSubmitting formsSubmitted formsSubmittedError formsNavigateToStep formsStepValidating",
                function (event, param1, param2) {
                    var eventType = event.type;
                    var formName = event.workingFormInfo.Name;
    
                    if (eventType == 'formsSetupCompleted') {
                        console.log('ODP: web_form impression: ' + formName);
                        zaius.event('web_form', { action: 'impression', form_name: formName });
                    } else if (eventType == 'formsStepValidating') {
                        if (!event.isValid) {
                            console.log('ODP: web_form validation failed: ' + formName);
                            zaius.event('web_form', { action: 'submission_validation_failed', form_name: formName });
                        }
                    } else if (eventType == 'formsSubmitted') {
                        console.log('ODP: web_form submission: ' + formName);
                        zaius.event('web_form', { action: 'submission', form_name: formName });
                    } else {
                        // handle other form events here
                    }
                });
        });
    }

Once that script is included on your site, then viewing a page with an Optimizely Form will trigger a "Web Form: Impression" event, and submitting a form will trigger a "Web Form: Submission" event:

![](https://blog.danisaacs.net/content/images/2022/01/form-events-impression-and-submission-v2.png)

### Usage in ODP

Once you're tracking those form events, you can start to put them to work for you. Some simple suggestions:

*   Build a report in ODP to track overall form conversion rates (impressions vs submissions)
*   Build a report in ODP to track form conversion rates for a specific form across multiple pages -- which page has more success?
*   Build a segment of visitors that saw the form, but didn't submit it -- convert that to a Facebook lookalike audience, and target them in an ad campaign

Let's walk through the steps for the first example -- a report to track form conversion rates:

![](https://blog.danisaacs.net/content/images/2022/01/forms-report-conversion-rate-by-form.png)

1.  First, create a filter -- Event Type = "web\_form" and Form Name is not empty

![](https://blog.danisaacs.net/content/images/2022/01/form-events-filter.png)

2\. Create a new report. Apply your new filter by clicking "All Traffic" in the top-left, and selecting your filter. Click the checkbox to apply:

![](https://blog.danisaacs.net/content/images/2022/01/form-events-apply-filter.png)

3\. Add columns to your report -- in this example, I added the field "Form Name", and then the following rocket columns to get the count of impressions, submissions and the calculated conversion rate:

![](https://blog.danisaacs.net/content/images/2022/01/forms-report-conversion-rate-by-form-rocket-columns.png)

Bonus: want to track an individual form, and see its success rate across different pages? Follow the steps above, and then:

1.  Use the "Simple Filter" option to specify the form by name (don't forget to click "Apply" after adding the simple filter!)

![](https://blog.danisaacs.net/content/images/2022/01/forms-report-conversion-rate-by-form-quick-filter.png)

2\. Add the Page to the report columns.

![](https://blog.danisaacs.net/content/images/2022/01/forms-report-conversion-rate-by-page.png)

## Search Events

Note: the example tracking below is specific to the [Foundation reference site](https://github.com/episerver/foundation), but the principles will apply and can easily be modified to fit any search implementation.

### ODP Prep

First, create a new field for the search term -- the scripts below use the field name "search\_term", type "text".

### Tracking

I've included three types of tracking below: the initial search event, searches with no results, and search result click tracking.

#### Initial Search Event

    // Enter for search
    $(document).keypress(function(event){
        var key = event.which;
        if(key == 13)  // the enter key code
        {
            var searchValue = null;
            var searchInputs = $('.jsSearchText');
            if (searchInputs != null)
            {
                for (var i = 0; i < searchInputs.length; i++)
                {
                    var input = searchInputs[i];
                    if (input.value != null && input.value != '')
                    {
                        searchValue = input.value;
                        console.log('ODP: search: ' + searchValue);
                        zaius.event('navigation', { action: 'search', search_term: searchValue });
                    }
                }
            }
        }
    });

#### "No Results" and Search Result Click Tracking

This script tracks searches that have no results, and also tracks search result clicks (breaking them up between clicks on content results versus product search results).

    $(document).ready(function() {
    	var searchValue = null;
    	const params = new URLSearchParams(window.location.search);
    	searchValue = params.get('search');
    		 
    	if (document.querySelector('.content-search-results') == null && document.querySelector('.product-tile-grid') == null) 
    	{
    		 console.log("ODP: Track no search results")
    		 zaius.event('search', { action: 'no_results' , search_term: searchValue });
    	}
    	
    	$('.content-search-results > a').click(function() {
    		let clickedLink = $(this).attr("href");
    		console.log("ODP: Track search result link click -- " + clickedLink + " (search term: " + searchValue + ")");
    		zaius.event('search', { action: 'click' , search_term: searchValue, search_clicked_content: clickedLink });
    	});
    
    	$('.product-tile-grid').click(function() {
    		let site = location.protocol + '//' + location.host;
    		let clickedProd = $(this).children('.product-tile-grid__title').children('a').attr("href");
    		let clickedProdLink  = site + clickedProd;
    		console.log("ODP: Track search result product click -- " + clickedProdLink + " (search term: " + searchValue + ")");
    		zaius.event('search', { action: 'click' , search_term: searchValue, search_clicked_product: clickedProdLink });
    	});
    });

### Usage in ODP

Search event tracking can be used in a variety of ways. A few quick examples include:

*   Top searches
*   Top searches without results
*   Clickthrough rate for search results

Build reports in ODP to identify popular searches and searches without results to help drive content creation. Create [Best Bets](https://webhelp.optimizely.com/latest/en/searchnavigation/best-bets.htm) in Optimizely Search & Navigation to address searches without results. Build segments to target visitors searching for specific search terms.

## Video Events

Just for fun, a rough implementation of tracking of YouTube video events. Identify users that loaded a video, and track their progress through it. Then use that data to identify popular (or unpopular) videos, or target visitors that stopped a certain video before completion, or visitors that are interested in certain types of videos.

### ODP Prep

For this example I added three new fields to ODP:

*   video\_id\_yt (YouTube video ID) (type: Text)
*   video\_play\_percentage (type: Number)
*   video\_title (type: Text)

### Video Event Tracking

The following script will track YouTube video events, including video loads, video plays, video progress (10%, 25%, 50%, 75%, 90%, and completed), and pauses/restarts. It leverages the [YouTube API for iframe embeds](https://developers.google.com/youtube/iframe_api_reference).

A couple caveats: the script as-is will only track if there is a single YouTube video block on the page, because it targets the video based on the id="youtube-block" attribute when the block is rendered.

    var tag = document.createElement('script');
    tag.id = 'youtube-iframe';
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    var player;
    function onYouTubeIframeAPIReady() {
        player = new YT.Player('youtube-block', {
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }
    
    var sendEvents = true;
    
    var videoDuration;
    var videoId;
    var videoTitle;
    var timer;
    var currentProgress = 0;
    var previousProgress = 0;
    var progressEventPoints = [10, 25, 50, 75, 90];
    
    
    var startedPlay = false;
    var pausedPlay = false;
    var halfway = false;
    
    function writeLoadVideoEvent() {
        console.log("ODP - video loaded - " + videoTitle);
        if (sendEvents) {
            zaius.event("video", {
                action: "loaded",
                video_id_yt: videoId,
                video_title: videoTitle,
                video_play_percentage: 0,
                video_action: true
            });
        }
    }
    
    function writeStartVideoEvent() {
        console.log("ODP - video started");
        if (sendEvents) {
            zaius.event("video", {
                action: "started",
                video_id_yt: videoId,
                video_title: videoTitle,
                video_play_percentage: 0,
                video_action: true
            });
        }
    }
    
    function writeHalfVideoEvent() {
        console.log("ODP - video 50% completed");
        if (sendEvents) {
            zaius.event("video", {
                action: "watched_half",
                video_id_yt: videoId,
                video_title: videoTitle,
                video_play_percentage: 50,
                video_action: true
            });
        }
    }
    
    function writeEndVideoEvent() {
        console.log("ODP - video completed");
        if (sendEvents) {
            zaius.event("video", {
                action: "watched",
                video_id_yt: videoId,
                video_title: videoTitle,
                video_play_percentage: 100,
                video_action: true
            });
        }
    }
    
    function writeVideoProgressEvent(percent) {
        console.log("ODP - video " + percent + "% completed");
        if (sendEvents) {
            zaius.event("video", {
                action: "video_progress",
                video_id_yt: videoId,
                video_title: videoTitle,
                video_play_percentage: percent,
                video_action: true
            });
        }
    }
    
    function writePauseVideoEvent(percent) {
        console.log("ODP - video paused " + percent + "%");
        if (sendEvents) {
            zaius.event("video", {
                action: "paused",
                video_id_yt: videoId,
                video_title: videoTitle,
                video_play_percentage: percent,
                video_action: true
            });
        }
    }
    
    function writeRestartVideoEvent(percent) {
        console.log("ODP - video restarted at " + percent + "%");
        if (sendEvents) {
            zaius.event("video", {
                action: "restarted",
                video_id_yt: videoId,
                video_title: videoTitle,
                video_play_percentage: percent,
                video_action: true
            });
        }
    }
    
    function onPlayerReady(event) {
        videoDuration = player.getDuration();
        videoId = player.getVideoData().video_id;
        videoTitle = player.getVideoData().title;
        writeLoadVideoEvent();
    }
    
    function play_progress_reached() {
        current_time = player.getCurrentTime();
        currentProgress = parseInt((current_time / videoDuration) * 100);
        if (player.getPlayerState() == YT.PlayerState.PLAYING) {
            if (startedPlay == false) {
                writeStartVideoEvent();
                startedPlay = true;
            } else if (pausedPlay == true) {
                writeRestartVideoEvent(currentProgress);
                pausedPlay = false;
            } else if (currentProgress > 0 && currentProgress % 5 == 0 && currentProgress > previousProgress) {
                if (currentProgress > previousProgress && progressEventPoints.includes(currentProgress)) {
                    writeVideoProgressEvent(currentProgress);
                    previousProgress = currentProgress;
                }
            }
        } else if (player.getPlayerState() == YT.PlayerState.PAUSED) {
            writePauseVideoEvent(currentProgress);
            pausedPlay = true;
            clearInterval(timer);
        } else if (player.getPlayerState() == YT.PlayerState.ENDED) {
            writeEndVideoEvent();
            clearInterval(timer);
        } else {
            clearInterval(timer);
        }
    }
    
    function play_progress_callback() {
        clearInterval(timer);
        current_time = player.getCurrentTime();
        currentProgress = parseInt((current_time / videoDuration) * 100);
        remaining_time = videoDuration - current_time;
        if (remaining_time > 0) {
            timer = setInterval(play_progress_reached, 500);
        }
    }
    
    function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.PLAYING) {
            console.log("Video playing");
        }
        clearInterval(timer);
        play_progress_callback();
    }

Usage in ODP

Use the tracked events to identify which videos are getting watched (and watched to completion), versus videos that aren't getting any plays at all or are frequently stopped before the end.

Here's a sample report, as a starting point:

![](https://blog.danisaacs.net/content/images/2022/01/video-events-report.png)

Conclusions
-----------

Optimizely Data Platform (ODP) provides your team with the flexibility to track any custom events for both known and unknown visitors, and use that information to build reports and create targeted campaigns to increase engagement with your visitors.

A few additional references for working with ODP:

*   Using ODP with Commerce Cloud: [https://www.david-tec.com/2021/05/adding-optimizely-data-platform-to-optimizely-commerce-cloud/](https://www.david-tec.com/2021/05/adding-optimizely-data-platform-to-optimizely-commerce-cloud/)
*   ODP reference guide: [https://world.optimizely.com/blogs/K-Khan-/Dates/2021/6/odp-handy-reference-guide---web-sdk/](https://world.optimizely.com/blogs/K-Khan-/Dates/2021/6/odp-handy-reference-guide---web-sdk/)
*   ODP documentation: [https://docs.zaius.com/](https://docs.zaius.com/)
*   ODP developer documentation: [https://docs.developers.zaius.com/](https://docs.developers.zaius.com/)

