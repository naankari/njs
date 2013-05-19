NJS.DOM = {
    Config: {
        element: function(tagName, attrs, children) {
            return {tagName: tagName, attrs: attrs, children: children};
        }
    },
    construct: function(config) {
        if(!config) {
            return null;
        }
        if(config instanceof Node) {
            return config;
        }
        if(typeof config == "string") {
            return document.createTextNode(config);
        }
        var tagName = config.tagName;
        var el = document.createElement(config.tagName);
        var attrs, children;
        if((attrs = config.attrs)) {
            for(var name in attrs) {
                if(!attrs.hasOwnProperty(name)) {
                    continue;
                }
                var value = attrs[name];
                if(value == null) {
                    continue;
                }
                el.setAttribute(name, String(value));
            }
        }
        if((children = config.children)) {
            children = NJS.array(children);
            for(var i = 0, len = children.length; i < len; i++) {
                el.appendChild(this.construct(children[i]));
            }
        }
        return el;
    },
    removeChildren: function(container) {
        var children = container.childNodes;
        for(var i = 0, len = children.length; i < len; i++) {
            container.removeChild(children[i]);
        }
    },
    insertBefore: function(container, children, beforeEl) {
        if(!children) {
            return null;
        }
        var ret = [];
        children = NJS.array(children);
        for(var i = 0, len = children.length; i < len; i++) {
            var child = this.construct(children[i]);
            ret.push(child);
            if(!child) {
                continue;
            }
            if(beforeEl) {
                container.insertBefore(child, beforeEl);
                continue;
            }
            container.appendChild(child);
        }
        return ret;
    },
    appendAfter: function(container, children, afterEl) {
        return this.insertBefore(container, children, afterEl ? afterEl.nextNode : null)
    },
    append: function(container, children, removeExisting) {
        if(removeExisting) {
           this.removeChildren(container);
        }
        return this.insertBefore(container, children);
    },
    innerText: function(container, text) {
        return this.append(container, [text], true);
    }
};
