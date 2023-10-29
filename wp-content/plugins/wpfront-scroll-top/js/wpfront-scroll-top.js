/*
 WPFront Scroll Top Plugin
 Copyright (C) 2013, WPFront.com
 Website: wpfront.com
 Contact: syam@wpfront.com
 
 WPFront Scroll Top Plugin is distributed under the GNU General Public License, Version 3,
 June 2007. Copyright (C) 2007 Free Software Foundation, Inc., 51 Franklin
 St, Fifth Floor, Boston, MA 02110, USA
 
 */

 (function(){
    var $ = jQuery;

    function bind_actions(data) {
        var container = $("#wpfront-scroll-top-container");

        var mouse_over = false;
        var hideEventID = 0;

        var fnHide = function () {
            clearTimeout(hideEventID);
            if (container.is(":visible")) {
                container.stop().fadeTo(data.button_fade_duration, 0, function () {
                    container.hide();
                    mouse_over = false;
                });
            }
        };

        var fnHideEvent = function () {
            if(!data.auto_hide)
                return;

            clearTimeout(hideEventID);
            hideEventID = setTimeout(function () {
                fnHide();
            }, data.auto_hide_after * 1000);
        };

        var scrollHandled = false;
        var fnScroll = function () {
            if (scrollHandled)
                return;

            scrollHandled = true;

            if ($(window).scrollTop() > data.scroll_offset) {
                container.stop().css("opacity", mouse_over ? 1 : data.button_opacity).show();
                if (!mouse_over) {
                    fnHideEvent();
                }
            } else {
                fnHide();
            }

            scrollHandled = false;
        };

        $(window).on('scroll', fnScroll);
        $(document).on('scroll', fnScroll);

        container
                .on('mouseenter', function() {
                    clearTimeout(hideEventID);
                    mouse_over = true;
                    $(this).css("opacity", 1);
                }).on('mouseleave', function() {
                    $(this).css("opacity", data.button_opacity);
                    mouse_over = false;
                    fnHideEvent();
                }).on('click', function(e) {
                    if(data.button_action === "url") {
                        return true;
                    } else if(data.button_action === "element") {
                        e.preventDefault();

                        var element = $(data.button_action_element_selector).first();
                        var container = $(data.button_action_container_selector);

                        var offset = element.offset();
                        if(offset == null)
                            return false;

                        var contOffset = container.last().offset();
                        if(contOffset == null)
                            return false;

                        data.button_action_element_offset = parseInt(data.button_action_element_offset);
                        if(isNaN(data.button_action_element_offset))
                            data.button_action_element_offset = 0;

                        var top = offset.top - contOffset.top - data.button_action_element_offset;

                        container.animate({scrollTop: top}, data.scroll_duration);

                        return false;
                    }

                    e.preventDefault();
                    $("html, body").animate({scrollTop: 0}, data.scroll_duration);
                    return false;
                });
    }

    $(window).on('load', function() {
        fetch(wpfront_scroll_top_data.source)
            .then(d => d.json())
            .then(d => {
                if(!d.success) {
                    console.log(d);
                    return Promise.reject('bad data');
                }

                return d.data;
            })
            .then(d => {
                if (d.data.hide_iframe) {
                    if ($(window).attr("self") !== $(window).attr("top")) {
                        return;
                    }
                }

                $('<style>').text(d.css).appendTo('head');
                $('body').append(d.html);

                bind_actions(d.data);
            })
            .catch(e => console.log(e));
    });
 })();
