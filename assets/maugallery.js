(function($) {
  // ---------------------------------------
  $.fn.mauGallery = function(options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function() {
      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      $.fn.mauGallery.listeners(options);

      $(this)
        .children(".gallery-item")
        .each(function(index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };
  // -----------------------------------

  // --- initialization ---
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };
// --- End of Initialization ----

// --- listeners management ---
  $.fn.mauGallery.listeners = function(options) {

    // --- open carrousel (lightbox) on click on gallery image 
    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

      // --- assign function "filterByTag" to Tags filters links
      $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
      
      // --- assign prevImage Function to "left arrow" button of carrousel
      $(".gallery").on("click", ".mg-prev", () =>{
        $.fn.mauGallery.methods.prevImage(options.lightboxId)}
      );
      // --- assign nextImage Function to "right arrow" button of carrousel
      $(".gallery").on("click", ".mg-next", () =>
        $.fn.mauGallery.methods.nextImage(options.lightboxId)
      );

  }; //--- end of listeners management ---



// --- list of Methods  ( = jquery functions )
  $.fn.mauGallery.methods = {
    // --- Create Row Wrapper
    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    }, // end of create Row wrapper

    // --- Wrap Item Column (depending on screen size)
    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },// end of Wrap Item Column

    // ---
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },// end of

    // ---
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    }, // end of

    // --- open lightBox (carrousel)
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },// end of open Lightbox

    // --- display previous image in the current image list (all or filtered)
    prevImage() {
      let activeImage = null;
      $("img.gallery-item").each(function() {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function() {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function() {
          if (
            $(this)
              .children("img")
              .data("gallery-tag") === activeTag
          ) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0,
      next = null;

      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i ; // index = i : on récupère l'index de l'image courante dans le tableau des images filtrées par la catégorie
        }
      });

      //Correction bug 15/2/24 : next prenait la valeur courante de l'index => donc le caroussel restait au même endroit
      /* next =
        imagesCollection[index] ||
        imagesCollection[imagesCollection.length - 1]; */
      // nouvelle assignation (15/2/24) : si l'index est à zéro, le précédent deviendra le dernier de la liste, sinon on décrémente d'1 l'index
      next = index === 0?imagesCollection[imagesCollection.length - 1]:imagesCollection[index-1] ;

      $(".lightboxImage").attr("src", $(next).attr("src"));
    }, // end of Previous Image function

    // --- Display Next Image in the current image list (all or filtered)
    nextImage() {
      let activeImage = null;
      $("img.gallery-item").each(function() {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function() {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function() {
          if (
            $(this)
              .children("img")
              .data("gallery-tag") === activeTag
          ) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0,
        next = null;

      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i;
        }
      });

      //Correction bug 15/2/24 : next prenait la valeur courante de l'index => donc le caroussel restait au même endroit
      /* next = imagesCollection[index] || imagesCollection[0]; */
      
      // nouvelle assignation (15/2/24) : si l'index est égale à la quantité d'images moins 1(on est au bout de la liste?)), le suivant deviendra le premier de la liste, sinon on incrémente d'1 l'index
      next = index === imagesCollection.length - 1?imagesCollection[0]:imagesCollection[index+1] ;

      $(".lightboxImage").attr("src", $(next).attr("src"));
    },// end of Next Image


    // --- create Light box, HTML (DOM) creation
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${
                              navigation
                                ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
    }, // end of light box creation


    // --- show item tags ---
    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item ">
                <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    }, //end of show item tags

    // --- filter by tag function ---
    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }
      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active-tag active"); //correction le 15/2/24 : la classe "active" n'était pas attribué au nav-link => pas de surbrillance du lien courant

      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function() {
        $(this)
          .parents(".item-column")
          .hide();
        if (tag === "all") {
          $(this)
            .parents(".item-column")
            .show(300);
        } else if ($(this).data("gallery-tag") === tag) {
          $(this)
            .parents(".item-column")
            .show(300);
        }
      });
    } // end of filter by tag


  }; // end of all methods (= functions)

  
})(jQuery);
