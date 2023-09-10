( function( $ ) {

  'use strict';

  function removeNoJsClass() {
    $( 'html:first' ).removeClass( 'no-js' );
  }

  /* Sidr Menu ---------------------*/
  function sidrMenu() {
    if ($("body.profile-logo-right")[0]) {
      $('#menu-toggle').sidr({
        name: 'side-menu',
        side: 'left', // By default
        source: '#navigation'
      });
    } else {
      $('#menu-toggle').sidr({
        name: 'side-menu',
        side: 'right', // By default
        source: '#navigation'
      });
    }
  }

  /* Submenu Offset Fix ---------------------*/
  function menuOffset() {
    var mainWindowWidth = $(window).width() + 120;

    $('ul.menu li.menu-item-has-children').mouseover(function() {

      // Checks if third level menu exist
      var subMenuExist = $(this).find('.sub-menu').length;
      if (subMenuExist > 0) {
        var subMenuWidth = $(this).find('.sub-menu').width();
        var subMenuOffset = $(this).find('.sub-menu').parent().offset().left + subMenuWidth;

        // If sub menu is off screen, give new position
        if ((subMenuOffset + subMenuWidth) > mainWindowWidth) {
          var newSubMenuPosition = subMenuWidth;
          $(this).find('.sub-menu').css({
            left: 'auto',
            right: '0'
          })
          $(this).find('.sub-menu .sub-menu').css({
            left: -newSubMenuPosition,
            right: '0'
          })
        }
      }
    })
  }

  function headerSetup() {
    if ( $('.wp-custom-header').hasClass('profile-lite-bg-dark') ) {
      $('#header .site-info, #header .excerpt').addClass('profile-lite-bg-dark');
    }
    if ( $('.profile-header-inactive.profile-singular .banner-img').hasClass('profile-lite-bg-light') ) {
      $('#header .site-info').addClass('profile-lite-bg-light');
    }
    if ( $('.profile-header-inactive.profile-singular .banner-img').hasClass('profile-lite-bg-dark') ) {
      $('#header').removeClass('profile-lite-bg-light').addClass('profile-lite-bg-dark');
    }
  }

  /* Check The Background Brightness ---------------------*/
  function checkBrightness() {
    if ( $('.banner-img').length ) {
      $('.banner-img').bgBrightness();
    }
    if ( $('.wp-custom-header').length ) {
      $('.wp-custom-header').bgBrightness();
    }
    $('body').bgBrightness();
    $('#custom-header').bgBrightness();
  }

  function modifyPosts() {

    /* Toggle Mobile Menu Icon ---------------------*/
    $('.menu-toggle').on('click touchstart', function() {
      $('.icon-menu-open').toggle();
      $('.icon-menu-close').toggle();
    });

    // Properly update the ARIA states on focus (keyboard) and mouse over events
    $( '[role="menubar"]' ).on( 'focus.aria  mouseenter.aria', '[aria-haspopup="true"]', function ( ev ) {
      $( ev.currentTarget ).attr( 'aria-expanded', true );
    } );

    // Properly update the ARIA states on blur (keyboard) and mouse out events
    $( '[role="menubar"]' ).on( 'blur.aria  mouseleave.aria', '[aria-haspopup="true"]', function ( ev ) {
      $( ev.currentTarget ).attr( 'aria-expanded', false );
    } );

    /* Animate Page Scroll ---------------------*/
    $(".scroll").click(function(event){
      event.preventDefault();
      $('html,body').animate({scrollTop:$(this.hash).offset().top}, 500);
    });

    /* Fit Vids ---------------------*/
    $('.content').fitVids();

  }

  $( document )
  .ready( removeNoJsClass )
  .ready( sidrMenu )
  .ready( menuOffset )
  .ready( checkBrightness )
  .ready( modifyPosts )
  .on( 'post-load', modifyPosts );

  $( window )
  .on( 'load', headerSetup );

})( jQuery );
