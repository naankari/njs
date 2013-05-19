NJS.Layout = function() {
    var scrollSize = NaN;
    var calculateScrollSize = function() {
        if (!isNaN(scrollSize)) {
            return;
        }
        try {
            var div = document.createElement("div");
            div.style.cssText = "width: 100px; height: 100px; overflow: auto; position: absolute; top: -100px; left: -100px;";
            document.body.appendChild(div);
            var newDiv = document.createElement("div");
            newDiv.style.cssText = "width:100%; height: 200px;";
            div.appendChild(newDiv);
            scrollSize = 100 - div.clientWidth;
            document.body.removeChild(div);
        } catch(ex) {}
    };
    var init = function() {
        if (window.document.readyState == "complete") {
            calculateScrollSize();
            return;
        }
        window.addEventListener("DOMContentLoaded", calculateScrollSize, false);
    };
    init();
    return ({
        hasXScroll: function() {
            return document.body.scrollWidth > window.innerWidth;
        },
        hasYScroll: function() {
            return document.body.scrollHeight > window.innerHeight;
        },
        getScrollSize: function() {
            if (scrollSize != NaN) {
                return scrollSize;
            }
            calculateScrollSize();
            return scrollSize;
        },
        confineToViewPort: function(coordinates, boxAttributes) {
            var top = coordinates.y;
            var left = coordinates.x;
            var scrollSize = this.getScrollSize();
            var scrollSizeX = this.hasYScroll() ? scrollSize: 0;
            var scrollSizeY = this.hasXScroll() ? scrollSize: 0;
            var sTop = this.getBodyScrollTop();
            var sLeft = this.getBodyScrollLeft();
            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;
            if (top <= sTop) {
                top = sTop;
            } else {
                top = (top + boxAttributes.height + scrollSizeY >= sTop + windowHeight) ? (sTop + windowHeight - boxAttributes.height - scrollSizeY) : top;
            }
            if (left <= sLeft) {
                left = sLeft;
            } else {
                left = (left + boxAttributes.width + scrollSizeX >= sLeft + windowWidth) ? (sLeft + windowWidth - boxAttributes.width - scrollSizeX) : left;
            }
            return {
                x: left,
                y: top
            };
        },
        getBodyScrollTop: function() {
            return Math.max(document.body.scrollTop, document.documentElement.scrollTop);
        },
        getBodyScrollLeft: function() {
            return Math.max(document.body.scrollLeft, document.documentElement.scrollLeft);
        },
        boxAttributes: function(node) {
            var rect = node.getBoundingClientRect();
            return {
                left: rect.left + Math.max(document.body.scrollLeft, document.documentElement.scrollLeft),
                top: rect.top + Math.max(document.body.scrollTop, document.documentElement.scrollTop),
                width: rect.width,
                height: rect.height
            };
        }
    });
} ();
