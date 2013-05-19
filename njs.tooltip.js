NJS.Tooltip = NJS.define({
    _defaultClassName: "njs-tooltip",
    _className: null,
    constructor: function(node, tooltipConfig, config) {
        config = config || {};
        var cls;
        if((cls = config.cls)) {
            _className = cls;
        }
        this._bind(node, tooltipConfig);
    },
    _getTooltipDiv: function(node, createIfNotFound) {
        var toolTipId = node.getAttribute("njsTooltipId");
        if(createIfNotFound === false && (toolTipId == null || toolTipId == null)) {
            return null;
        }
        if(toolTipId) {
            return document.getElementById(toolTipId);
        }
        toolTipId = NJS.unique("njs-tooltip");
        node.setAttribute("njsTooltipId", toolTipId);
        
        var div = document.createElement("div");
        div.setAttribute("id", toolTipId);
        div.className = this._defaultClassName + (this._className ? (" " + this._className) : "");
        div.style.visibility = "hidden";
        div.style.display = "none";
        div.style.position = "absolute";
        div.style.zIndex = 10000000;
        document.body.appendChild(div);
        return div;
    },
    _bind: function(node, tootipConfig) {
        var me = this;
        node.addEventListener("mouseover", function() {
            me._showTooltip(node);
        }, false);
        node.addEventListener("mouseout", function() {
            me._hideTooltip(node);
        }, false);
        NJS.DOM.append(this._getTooltipDiv(node), tootipConfig);
    },
    _showTooltip: function(node) {
        var div = this._getTooltipDiv(node);
        div.style.left = "-1000px";
        div.style.display = "inline";
        div.style.visibility = "visible";
        var boxAttributes = NJS.Layout.boxAttributes(node);
        var c = NJS.Layout.confineToViewPort({
            y: boxAttributes.top + boxAttributes.height,
            x: boxAttributes.left + boxAttributes.width
        },
        {
            width: div.clientWidth + 15,
            height: div.clientHeight + 15
        });
        div.style.top = c.y + "px";
        div.style.left = c.x + "px";
    },
    _hideTooltip: function(node) {
        var div = this._getTooltipDiv(node, false);;
        if (!div) {
            return;
        }
        div.style.visibility = "hidden";
        div.style.display = "none";
    }
});
