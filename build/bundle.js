
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop$1() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop$1;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty$2() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop$1,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop$1;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\interfaces\tile\tile.svelte generated by Svelte v3.42.2 */

    class Tile$1 {
    	constructor(val) {
    		this._value = val;
    	}

    	get isFilled() {
    		return this._value === 1;
    	}

    	get isAnimated() {
    		return this._value === 2;
    	}
    }

    /* src\interfaces\tile\filled-tile.svelte generated by Svelte v3.42.2 */

    class FilledTile extends Tile$1 {
    	constructor(isSolid = false) {
    		super(1);
    		this.isSolid = isSolid;
    	}
    }

    /* src\components\tile\tile.svelte generated by Svelte v3.42.2 */

    const file$f = "src\\components\\tile\\tile.svelte";

    function create_fragment$m(ctx) {
    	let div;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(className(/*tile*/ ctx[0])) + " svelte-156na4h"));
    			add_location(div, file$f, 16, 0, 268);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[2](div);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tile*/ 1 && div_class_value !== (div_class_value = "" + (null_to_empty(className(/*tile*/ ctx[0])) + " svelte-156na4h"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[2](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function className(tile) {
    	if (!tile) {
    		return;
    	}

    	if (tile.isFilled) {
    		return "filled";
    	}

    	if (tile.isAnimated) {
    		return "animated";
    	}
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tile', slots, []);
    	
    	let { tile } = $$props;
    	let tileElementRef;
    	const writable_props = ['tile'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tile> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			tileElementRef = $$value;
    			$$invalidate(1, tileElementRef);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('tile' in $$props) $$invalidate(0, tile = $$props.tile);
    	};

    	$$self.$capture_state = () => ({ tile, tileElementRef, className });

    	$$self.$inject_state = $$props => {
    		if ('tile' in $$props) $$invalidate(0, tile = $$props.tile);
    		if ('tileElementRef' in $$props) $$invalidate(1, tileElementRef = $$props.tileElementRef);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tile, tileElementRef, div_binding];
    }

    class Tile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { tile: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tile",
    			options,
    			id: create_fragment$m.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tile*/ ctx[0] === undefined && !('tile' in props)) {
    			console.warn("<Tile> was created without expected prop 'tile'");
    		}
    	}

    	get tile() {
    		throw new Error("<Tile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<Tile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\screen\screen.svelte generated by Svelte v3.42.2 */
    const file$e = "src\\components\\screen\\screen.svelte";

    function create_fragment$l(ctx) {
    	let div0;
    	let span0;
    	let t0;
    	let span1;
    	let t1;
    	let span2;
    	let t2;
    	let span3;
    	let t3;
    	let span4;
    	let t4;
    	let span5;
    	let t5;
    	let span6;
    	let t6;
    	let span7;
    	let t7;
    	let span8;
    	let t8;
    	let span9;
    	let t9;
    	let h1;
    	let t11;
    	let div12;
    	let ttile0;
    	let t12;
    	let div1;
    	let t13;
    	let ttile1;
    	let t14;
    	let ttile2;
    	let t15;
    	let div2;
    	let t16;
    	let em0;
    	let t17;
    	let ttile3;
    	let t18;
    	let p0;
    	let t19;
    	let em1;
    	let t20;
    	let ttile4;
    	let t21;
    	let div3;
    	let t22;
    	let ttile5;
    	let t23;
    	let ttile6;
    	let t24;
    	let div4;
    	let t25;
    	let em2;
    	let t26;
    	let ttile7;
    	let t27;
    	let p1;
    	let t28;
    	let ttile8;
    	let t29;
    	let ttile9;
    	let t30;
    	let ttile10;
    	let t31;
    	let ttile11;
    	let t32;
    	let p2;
    	let t33;
    	let ttile12;
    	let t34;
    	let div5;
    	let t35;
    	let ttile13;
    	let t36;
    	let ttile14;
    	let t37;
    	let div6;
    	let t38;
    	let ttile15;
    	let t39;
    	let p3;
    	let t40;
    	let ttile16;
    	let t41;
    	let ttile17;
    	let t42;
    	let div7;
    	let t43;
    	let ttile18;
    	let t44;
    	let div8;
    	let t45;
    	let ttile19;
    	let t46;
    	let p4;
    	let t47;
    	let em3;
    	let t48;
    	let ttile20;
    	let t49;
    	let div9;
    	let t50;
    	let em4;
    	let t51;
    	let ttile21;
    	let t52;
    	let div10;
    	let t53;
    	let em5;
    	let t54;
    	let ttile22;
    	let t55;
    	let div11;
    	let t56;
    	let em6;
    	let t57;
    	let ttile23;
    	let t58;
    	let div24;
    	let em7;
    	let t59;
    	let ttile24;
    	let t60;
    	let div13;
    	let t61;
    	let ttile25;
    	let t62;
    	let ttile26;
    	let t63;
    	let div14;
    	let t64;
    	let ttile27;
    	let t65;
    	let p5;
    	let t66;
    	let ttile28;
    	let t67;
    	let div15;
    	let t68;
    	let ttile29;
    	let t69;
    	let ttile30;
    	let t70;
    	let div16;
    	let t71;
    	let ttile31;
    	let t72;
    	let p6;
    	let t73;
    	let ttile32;
    	let t74;
    	let ttile33;
    	let t75;
    	let ttile34;
    	let t76;
    	let ttile35;
    	let t77;
    	let p7;
    	let t78;
    	let em8;
    	let t79;
    	let ttile36;
    	let t80;
    	let div17;
    	let t81;
    	let ttile37;
    	let t82;
    	let ttile38;
    	let t83;
    	let div18;
    	let t84;
    	let em9;
    	let t85;
    	let ttile39;
    	let t86;
    	let p8;
    	let t87;
    	let ttile40;
    	let t88;
    	let ttile41;
    	let t89;
    	let div19;
    	let t90;
    	let em10;
    	let t91;
    	let ttile42;
    	let t92;
    	let div20;
    	let t93;
    	let em11;
    	let t94;
    	let ttile43;
    	let t95;
    	let p9;
    	let t96;
    	let ttile44;
    	let t97;
    	let div21;
    	let t98;
    	let ttile45;
    	let t99;
    	let div22;
    	let t100;
    	let ttile46;
    	let t101;
    	let div23;
    	let t102;
    	let ttile47;
    	let current;

    	ttile0 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile1 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile2 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile3 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile4 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile5 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile6 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile7 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile8 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile9 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile10 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile11 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile12 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile13 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile14 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile15 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile16 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile17 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile18 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile19 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile20 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile21 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile22 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile23 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile24 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile25 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile26 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile27 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile28 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile29 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile30 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile31 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile32 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile33 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile34 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile35 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile36 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile37 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile38 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile39 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile40 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile41 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile42 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile43 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile44 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile45 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile46 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	ttile47 = new Tile({
    			props: { tile: /*filled*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			span0 = element("span");
    			t0 = space();
    			span1 = element("span");
    			t1 = space();
    			span2 = element("span");
    			t2 = space();
    			span3 = element("span");
    			t3 = space();
    			span4 = element("span");
    			t4 = space();
    			span5 = element("span");
    			t5 = space();
    			span6 = element("span");
    			t6 = space();
    			span7 = element("span");
    			t7 = space();
    			span8 = element("span");
    			t8 = space();
    			span9 = element("span");
    			t9 = space();
    			h1 = element("h1");
    			h1.textContent = `${title}`;
    			t11 = space();
    			div12 = element("div");
    			create_component(ttile0.$$.fragment);
    			t12 = space();
    			div1 = element("div");
    			t13 = space();
    			create_component(ttile1.$$.fragment);
    			t14 = space();
    			create_component(ttile2.$$.fragment);
    			t15 = space();
    			div2 = element("div");
    			t16 = space();
    			em0 = element("em");
    			t17 = space();
    			create_component(ttile3.$$.fragment);
    			t18 = space();
    			p0 = element("p");
    			t19 = space();
    			em1 = element("em");
    			t20 = space();
    			create_component(ttile4.$$.fragment);
    			t21 = space();
    			div3 = element("div");
    			t22 = space();
    			create_component(ttile5.$$.fragment);
    			t23 = space();
    			create_component(ttile6.$$.fragment);
    			t24 = space();
    			div4 = element("div");
    			t25 = space();
    			em2 = element("em");
    			t26 = space();
    			create_component(ttile7.$$.fragment);
    			t27 = space();
    			p1 = element("p");
    			t28 = space();
    			create_component(ttile8.$$.fragment);
    			t29 = space();
    			create_component(ttile9.$$.fragment);
    			t30 = space();
    			create_component(ttile10.$$.fragment);
    			t31 = space();
    			create_component(ttile11.$$.fragment);
    			t32 = space();
    			p2 = element("p");
    			t33 = space();
    			create_component(ttile12.$$.fragment);
    			t34 = space();
    			div5 = element("div");
    			t35 = space();
    			create_component(ttile13.$$.fragment);
    			t36 = space();
    			create_component(ttile14.$$.fragment);
    			t37 = space();
    			div6 = element("div");
    			t38 = space();
    			create_component(ttile15.$$.fragment);
    			t39 = space();
    			p3 = element("p");
    			t40 = space();
    			create_component(ttile16.$$.fragment);
    			t41 = space();
    			create_component(ttile17.$$.fragment);
    			t42 = space();
    			div7 = element("div");
    			t43 = space();
    			create_component(ttile18.$$.fragment);
    			t44 = space();
    			div8 = element("div");
    			t45 = space();
    			create_component(ttile19.$$.fragment);
    			t46 = space();
    			p4 = element("p");
    			t47 = space();
    			em3 = element("em");
    			t48 = space();
    			create_component(ttile20.$$.fragment);
    			t49 = space();
    			div9 = element("div");
    			t50 = space();
    			em4 = element("em");
    			t51 = space();
    			create_component(ttile21.$$.fragment);
    			t52 = space();
    			div10 = element("div");
    			t53 = space();
    			em5 = element("em");
    			t54 = space();
    			create_component(ttile22.$$.fragment);
    			t55 = space();
    			div11 = element("div");
    			t56 = space();
    			em6 = element("em");
    			t57 = space();
    			create_component(ttile23.$$.fragment);
    			t58 = space();
    			div24 = element("div");
    			em7 = element("em");
    			t59 = space();
    			create_component(ttile24.$$.fragment);
    			t60 = space();
    			div13 = element("div");
    			t61 = space();
    			create_component(ttile25.$$.fragment);
    			t62 = space();
    			create_component(ttile26.$$.fragment);
    			t63 = space();
    			div14 = element("div");
    			t64 = space();
    			create_component(ttile27.$$.fragment);
    			t65 = space();
    			p5 = element("p");
    			t66 = space();
    			create_component(ttile28.$$.fragment);
    			t67 = space();
    			div15 = element("div");
    			t68 = space();
    			create_component(ttile29.$$.fragment);
    			t69 = space();
    			create_component(ttile30.$$.fragment);
    			t70 = space();
    			div16 = element("div");
    			t71 = space();
    			create_component(ttile31.$$.fragment);
    			t72 = space();
    			p6 = element("p");
    			t73 = space();
    			create_component(ttile32.$$.fragment);
    			t74 = space();
    			create_component(ttile33.$$.fragment);
    			t75 = space();
    			create_component(ttile34.$$.fragment);
    			t76 = space();
    			create_component(ttile35.$$.fragment);
    			t77 = space();
    			p7 = element("p");
    			t78 = space();
    			em8 = element("em");
    			t79 = space();
    			create_component(ttile36.$$.fragment);
    			t80 = space();
    			div17 = element("div");
    			t81 = space();
    			create_component(ttile37.$$.fragment);
    			t82 = space();
    			create_component(ttile38.$$.fragment);
    			t83 = space();
    			div18 = element("div");
    			t84 = space();
    			em9 = element("em");
    			t85 = space();
    			create_component(ttile39.$$.fragment);
    			t86 = space();
    			p8 = element("p");
    			t87 = space();
    			create_component(ttile40.$$.fragment);
    			t88 = space();
    			create_component(ttile41.$$.fragment);
    			t89 = space();
    			div19 = element("div");
    			t90 = space();
    			em10 = element("em");
    			t91 = space();
    			create_component(ttile42.$$.fragment);
    			t92 = space();
    			div20 = element("div");
    			t93 = space();
    			em11 = element("em");
    			t94 = space();
    			create_component(ttile43.$$.fragment);
    			t95 = space();
    			p9 = element("p");
    			t96 = space();
    			create_component(ttile44.$$.fragment);
    			t97 = space();
    			div21 = element("div");
    			t98 = space();
    			create_component(ttile45.$$.fragment);
    			t99 = space();
    			div22 = element("div");
    			t100 = space();
    			create_component(ttile46.$$.fragment);
    			t101 = space();
    			div23 = element("div");
    			t102 = space();
    			create_component(ttile47.$$.fragment);
    			attr_dev(span0, "class", "l mr-10 w-40 svelte-2e3mym");
    			add_location(span0, file$e, 7, 2, 238);
    			attr_dev(span1, "class", "l mr-10 svelte-2e3mym");
    			add_location(span1, file$e, 8, 2, 271);
    			attr_dev(span2, "class", "l mr-10 svelte-2e3mym");
    			add_location(span2, file$e, 9, 2, 299);
    			attr_dev(span3, "class", "l mr-10 svelte-2e3mym");
    			add_location(span3, file$e, 10, 2, 327);
    			attr_dev(span4, "class", "l mr-10 svelte-2e3mym");
    			add_location(span4, file$e, 11, 2, 355);
    			attr_dev(span5, "class", "r ml-10 w-40 svelte-2e3mym");
    			add_location(span5, file$e, 12, 2, 383);
    			attr_dev(span6, "class", "r ml-10 svelte-2e3mym");
    			add_location(span6, file$e, 13, 2, 416);
    			attr_dev(span7, "class", "r ml-10 svelte-2e3mym");
    			add_location(span7, file$e, 14, 2, 444);
    			attr_dev(span8, "class", "r ml-10 svelte-2e3mym");
    			add_location(span8, file$e, 15, 2, 472);
    			attr_dev(span9, "class", "r ml-10 svelte-2e3mym");
    			add_location(span9, file$e, 16, 2, 500);
    			attr_dev(div0, "class", "topBorder svelte-2e3mym");
    			add_location(div0, file$e, 6, 0, 211);
    			attr_dev(h1, "class", "svelte-2e3mym");
    			add_location(h1, file$e, 18, 0, 534);
    			attr_dev(div1, "class", "clear svelte-2e3mym");
    			add_location(div1, file$e, 21, 2, 601);
    			attr_dev(div2, "class", "clear svelte-2e3mym");
    			add_location(div2, file$e, 24, 2, 680);
    			attr_dev(em0, "class", "svelte-2e3mym");
    			add_location(em0, file$e, 25, 2, 705);
    			attr_dev(p0, "class", "svelte-2e3mym");
    			add_location(p0, file$e, 27, 2, 742);
    			attr_dev(em1, "class", "svelte-2e3mym");
    			add_location(em1, file$e, 28, 2, 751);
    			attr_dev(div3, "class", "clear svelte-2e3mym");
    			add_location(div3, file$e, 30, 2, 788);
    			attr_dev(div4, "class", "clear svelte-2e3mym");
    			add_location(div4, file$e, 33, 2, 867);
    			attr_dev(em2, "class", "svelte-2e3mym");
    			add_location(em2, file$e, 34, 2, 892);
    			attr_dev(p1, "class", "svelte-2e3mym");
    			add_location(p1, file$e, 36, 2, 929);
    			attr_dev(p2, "class", "svelte-2e3mym");
    			add_location(p2, file$e, 41, 2, 1046);
    			attr_dev(div5, "class", "clear svelte-2e3mym");
    			add_location(div5, file$e, 43, 2, 1082);
    			attr_dev(div6, "class", "clear svelte-2e3mym");
    			add_location(div6, file$e, 46, 2, 1161);
    			attr_dev(p3, "class", "svelte-2e3mym");
    			add_location(p3, file$e, 48, 2, 1213);
    			attr_dev(div7, "class", "clear svelte-2e3mym");
    			add_location(div7, file$e, 51, 2, 1276);
    			attr_dev(div8, "class", "clear svelte-2e3mym");
    			add_location(div8, file$e, 53, 2, 1328);
    			attr_dev(p4, "class", "svelte-2e3mym");
    			add_location(p4, file$e, 55, 2, 1380);
    			attr_dev(em3, "class", "svelte-2e3mym");
    			add_location(em3, file$e, 56, 2, 1389);
    			attr_dev(div9, "class", "clear svelte-2e3mym");
    			add_location(div9, file$e, 58, 2, 1426);
    			attr_dev(em4, "class", "svelte-2e3mym");
    			add_location(em4, file$e, 59, 2, 1451);
    			attr_dev(div10, "class", "clear svelte-2e3mym");
    			add_location(div10, file$e, 61, 2, 1488);
    			attr_dev(em5, "class", "svelte-2e3mym");
    			add_location(em5, file$e, 62, 2, 1513);
    			attr_dev(div11, "class", "clear svelte-2e3mym");
    			add_location(div11, file$e, 64, 2, 1550);
    			attr_dev(em6, "class", "svelte-2e3mym");
    			add_location(em6, file$e, 65, 2, 1575);
    			attr_dev(div12, "class", "view svelte-2e3mym");
    			add_location(div12, file$e, 19, 0, 552);
    			attr_dev(em7, "class", "svelte-2e3mym");
    			add_location(em7, file$e, 69, 2, 1642);
    			attr_dev(div13, "class", "clear svelte-2e3mym");
    			add_location(div13, file$e, 71, 2, 1679);
    			attr_dev(div14, "class", "clear svelte-2e3mym");
    			add_location(div14, file$e, 74, 2, 1758);
    			attr_dev(p5, "class", "svelte-2e3mym");
    			add_location(p5, file$e, 76, 2, 1810);
    			attr_dev(div15, "class", "clear svelte-2e3mym");
    			add_location(div15, file$e, 78, 2, 1846);
    			attr_dev(div16, "class", "clear svelte-2e3mym");
    			add_location(div16, file$e, 81, 2, 1925);
    			attr_dev(p6, "class", "svelte-2e3mym");
    			add_location(p6, file$e, 83, 2, 1977);
    			attr_dev(p7, "class", "svelte-2e3mym");
    			add_location(p7, file$e, 88, 2, 2094);
    			attr_dev(em8, "class", "svelte-2e3mym");
    			add_location(em8, file$e, 89, 2, 2103);
    			attr_dev(div17, "class", "clear svelte-2e3mym");
    			add_location(div17, file$e, 91, 2, 2140);
    			attr_dev(div18, "class", "clear svelte-2e3mym");
    			add_location(div18, file$e, 94, 2, 2219);
    			attr_dev(em9, "class", "svelte-2e3mym");
    			add_location(em9, file$e, 95, 2, 2244);
    			attr_dev(p8, "class", "svelte-2e3mym");
    			add_location(p8, file$e, 97, 2, 2281);
    			attr_dev(div19, "class", "clear svelte-2e3mym");
    			add_location(div19, file$e, 100, 2, 2344);
    			attr_dev(em10, "class", "svelte-2e3mym");
    			add_location(em10, file$e, 101, 2, 2369);
    			attr_dev(div20, "class", "clear svelte-2e3mym");
    			add_location(div20, file$e, 103, 2, 2406);
    			attr_dev(em11, "class", "svelte-2e3mym");
    			add_location(em11, file$e, 104, 2, 2431);
    			attr_dev(p9, "class", "svelte-2e3mym");
    			add_location(p9, file$e, 106, 2, 2468);
    			attr_dev(div21, "class", "clear svelte-2e3mym");
    			add_location(div21, file$e, 108, 2, 2504);
    			attr_dev(div22, "class", "clear svelte-2e3mym");
    			add_location(div22, file$e, 110, 2, 2556);
    			attr_dev(div23, "class", "clear svelte-2e3mym");
    			add_location(div23, file$e, 112, 2, 2608);
    			attr_dev(div24, "class", "view l svelte-2e3mym");
    			add_location(div24, file$e, 68, 0, 1618);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, span0);
    			append_dev(div0, t0);
    			append_dev(div0, span1);
    			append_dev(div0, t1);
    			append_dev(div0, span2);
    			append_dev(div0, t2);
    			append_dev(div0, span3);
    			append_dev(div0, t3);
    			append_dev(div0, span4);
    			append_dev(div0, t4);
    			append_dev(div0, span5);
    			append_dev(div0, t5);
    			append_dev(div0, span6);
    			append_dev(div0, t6);
    			append_dev(div0, span7);
    			append_dev(div0, t7);
    			append_dev(div0, span8);
    			append_dev(div0, t8);
    			append_dev(div0, span9);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div12, anchor);
    			mount_component(ttile0, div12, null);
    			append_dev(div12, t12);
    			append_dev(div12, div1);
    			append_dev(div12, t13);
    			mount_component(ttile1, div12, null);
    			append_dev(div12, t14);
    			mount_component(ttile2, div12, null);
    			append_dev(div12, t15);
    			append_dev(div12, div2);
    			append_dev(div12, t16);
    			append_dev(div12, em0);
    			append_dev(div12, t17);
    			mount_component(ttile3, div12, null);
    			append_dev(div12, t18);
    			append_dev(div12, p0);
    			append_dev(div12, t19);
    			append_dev(div12, em1);
    			append_dev(div12, t20);
    			mount_component(ttile4, div12, null);
    			append_dev(div12, t21);
    			append_dev(div12, div3);
    			append_dev(div12, t22);
    			mount_component(ttile5, div12, null);
    			append_dev(div12, t23);
    			mount_component(ttile6, div12, null);
    			append_dev(div12, t24);
    			append_dev(div12, div4);
    			append_dev(div12, t25);
    			append_dev(div12, em2);
    			append_dev(div12, t26);
    			mount_component(ttile7, div12, null);
    			append_dev(div12, t27);
    			append_dev(div12, p1);
    			append_dev(div12, t28);
    			mount_component(ttile8, div12, null);
    			append_dev(div12, t29);
    			mount_component(ttile9, div12, null);
    			append_dev(div12, t30);
    			mount_component(ttile10, div12, null);
    			append_dev(div12, t31);
    			mount_component(ttile11, div12, null);
    			append_dev(div12, t32);
    			append_dev(div12, p2);
    			append_dev(div12, t33);
    			mount_component(ttile12, div12, null);
    			append_dev(div12, t34);
    			append_dev(div12, div5);
    			append_dev(div12, t35);
    			mount_component(ttile13, div12, null);
    			append_dev(div12, t36);
    			mount_component(ttile14, div12, null);
    			append_dev(div12, t37);
    			append_dev(div12, div6);
    			append_dev(div12, t38);
    			mount_component(ttile15, div12, null);
    			append_dev(div12, t39);
    			append_dev(div12, p3);
    			append_dev(div12, t40);
    			mount_component(ttile16, div12, null);
    			append_dev(div12, t41);
    			mount_component(ttile17, div12, null);
    			append_dev(div12, t42);
    			append_dev(div12, div7);
    			append_dev(div12, t43);
    			mount_component(ttile18, div12, null);
    			append_dev(div12, t44);
    			append_dev(div12, div8);
    			append_dev(div12, t45);
    			mount_component(ttile19, div12, null);
    			append_dev(div12, t46);
    			append_dev(div12, p4);
    			append_dev(div12, t47);
    			append_dev(div12, em3);
    			append_dev(div12, t48);
    			mount_component(ttile20, div12, null);
    			append_dev(div12, t49);
    			append_dev(div12, div9);
    			append_dev(div12, t50);
    			append_dev(div12, em4);
    			append_dev(div12, t51);
    			mount_component(ttile21, div12, null);
    			append_dev(div12, t52);
    			append_dev(div12, div10);
    			append_dev(div12, t53);
    			append_dev(div12, em5);
    			append_dev(div12, t54);
    			mount_component(ttile22, div12, null);
    			append_dev(div12, t55);
    			append_dev(div12, div11);
    			append_dev(div12, t56);
    			append_dev(div12, em6);
    			append_dev(div12, t57);
    			mount_component(ttile23, div12, null);
    			insert_dev(target, t58, anchor);
    			insert_dev(target, div24, anchor);
    			append_dev(div24, em7);
    			append_dev(div24, t59);
    			mount_component(ttile24, div24, null);
    			append_dev(div24, t60);
    			append_dev(div24, div13);
    			append_dev(div24, t61);
    			mount_component(ttile25, div24, null);
    			append_dev(div24, t62);
    			mount_component(ttile26, div24, null);
    			append_dev(div24, t63);
    			append_dev(div24, div14);
    			append_dev(div24, t64);
    			mount_component(ttile27, div24, null);
    			append_dev(div24, t65);
    			append_dev(div24, p5);
    			append_dev(div24, t66);
    			mount_component(ttile28, div24, null);
    			append_dev(div24, t67);
    			append_dev(div24, div15);
    			append_dev(div24, t68);
    			mount_component(ttile29, div24, null);
    			append_dev(div24, t69);
    			mount_component(ttile30, div24, null);
    			append_dev(div24, t70);
    			append_dev(div24, div16);
    			append_dev(div24, t71);
    			mount_component(ttile31, div24, null);
    			append_dev(div24, t72);
    			append_dev(div24, p6);
    			append_dev(div24, t73);
    			mount_component(ttile32, div24, null);
    			append_dev(div24, t74);
    			mount_component(ttile33, div24, null);
    			append_dev(div24, t75);
    			mount_component(ttile34, div24, null);
    			append_dev(div24, t76);
    			mount_component(ttile35, div24, null);
    			append_dev(div24, t77);
    			append_dev(div24, p7);
    			append_dev(div24, t78);
    			append_dev(div24, em8);
    			append_dev(div24, t79);
    			mount_component(ttile36, div24, null);
    			append_dev(div24, t80);
    			append_dev(div24, div17);
    			append_dev(div24, t81);
    			mount_component(ttile37, div24, null);
    			append_dev(div24, t82);
    			mount_component(ttile38, div24, null);
    			append_dev(div24, t83);
    			append_dev(div24, div18);
    			append_dev(div24, t84);
    			append_dev(div24, em9);
    			append_dev(div24, t85);
    			mount_component(ttile39, div24, null);
    			append_dev(div24, t86);
    			append_dev(div24, p8);
    			append_dev(div24, t87);
    			mount_component(ttile40, div24, null);
    			append_dev(div24, t88);
    			mount_component(ttile41, div24, null);
    			append_dev(div24, t89);
    			append_dev(div24, div19);
    			append_dev(div24, t90);
    			append_dev(div24, em10);
    			append_dev(div24, t91);
    			mount_component(ttile42, div24, null);
    			append_dev(div24, t92);
    			append_dev(div24, div20);
    			append_dev(div24, t93);
    			append_dev(div24, em11);
    			append_dev(div24, t94);
    			mount_component(ttile43, div24, null);
    			append_dev(div24, t95);
    			append_dev(div24, p9);
    			append_dev(div24, t96);
    			mount_component(ttile44, div24, null);
    			append_dev(div24, t97);
    			append_dev(div24, div21);
    			append_dev(div24, t98);
    			mount_component(ttile45, div24, null);
    			append_dev(div24, t99);
    			append_dev(div24, div22);
    			append_dev(div24, t100);
    			mount_component(ttile46, div24, null);
    			append_dev(div24, t101);
    			append_dev(div24, div23);
    			append_dev(div24, t102);
    			mount_component(ttile47, div24, null);
    			current = true;
    		},
    		p: noop$1,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ttile0.$$.fragment, local);
    			transition_in(ttile1.$$.fragment, local);
    			transition_in(ttile2.$$.fragment, local);
    			transition_in(ttile3.$$.fragment, local);
    			transition_in(ttile4.$$.fragment, local);
    			transition_in(ttile5.$$.fragment, local);
    			transition_in(ttile6.$$.fragment, local);
    			transition_in(ttile7.$$.fragment, local);
    			transition_in(ttile8.$$.fragment, local);
    			transition_in(ttile9.$$.fragment, local);
    			transition_in(ttile10.$$.fragment, local);
    			transition_in(ttile11.$$.fragment, local);
    			transition_in(ttile12.$$.fragment, local);
    			transition_in(ttile13.$$.fragment, local);
    			transition_in(ttile14.$$.fragment, local);
    			transition_in(ttile15.$$.fragment, local);
    			transition_in(ttile16.$$.fragment, local);
    			transition_in(ttile17.$$.fragment, local);
    			transition_in(ttile18.$$.fragment, local);
    			transition_in(ttile19.$$.fragment, local);
    			transition_in(ttile20.$$.fragment, local);
    			transition_in(ttile21.$$.fragment, local);
    			transition_in(ttile22.$$.fragment, local);
    			transition_in(ttile23.$$.fragment, local);
    			transition_in(ttile24.$$.fragment, local);
    			transition_in(ttile25.$$.fragment, local);
    			transition_in(ttile26.$$.fragment, local);
    			transition_in(ttile27.$$.fragment, local);
    			transition_in(ttile28.$$.fragment, local);
    			transition_in(ttile29.$$.fragment, local);
    			transition_in(ttile30.$$.fragment, local);
    			transition_in(ttile31.$$.fragment, local);
    			transition_in(ttile32.$$.fragment, local);
    			transition_in(ttile33.$$.fragment, local);
    			transition_in(ttile34.$$.fragment, local);
    			transition_in(ttile35.$$.fragment, local);
    			transition_in(ttile36.$$.fragment, local);
    			transition_in(ttile37.$$.fragment, local);
    			transition_in(ttile38.$$.fragment, local);
    			transition_in(ttile39.$$.fragment, local);
    			transition_in(ttile40.$$.fragment, local);
    			transition_in(ttile41.$$.fragment, local);
    			transition_in(ttile42.$$.fragment, local);
    			transition_in(ttile43.$$.fragment, local);
    			transition_in(ttile44.$$.fragment, local);
    			transition_in(ttile45.$$.fragment, local);
    			transition_in(ttile46.$$.fragment, local);
    			transition_in(ttile47.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ttile0.$$.fragment, local);
    			transition_out(ttile1.$$.fragment, local);
    			transition_out(ttile2.$$.fragment, local);
    			transition_out(ttile3.$$.fragment, local);
    			transition_out(ttile4.$$.fragment, local);
    			transition_out(ttile5.$$.fragment, local);
    			transition_out(ttile6.$$.fragment, local);
    			transition_out(ttile7.$$.fragment, local);
    			transition_out(ttile8.$$.fragment, local);
    			transition_out(ttile9.$$.fragment, local);
    			transition_out(ttile10.$$.fragment, local);
    			transition_out(ttile11.$$.fragment, local);
    			transition_out(ttile12.$$.fragment, local);
    			transition_out(ttile13.$$.fragment, local);
    			transition_out(ttile14.$$.fragment, local);
    			transition_out(ttile15.$$.fragment, local);
    			transition_out(ttile16.$$.fragment, local);
    			transition_out(ttile17.$$.fragment, local);
    			transition_out(ttile18.$$.fragment, local);
    			transition_out(ttile19.$$.fragment, local);
    			transition_out(ttile20.$$.fragment, local);
    			transition_out(ttile21.$$.fragment, local);
    			transition_out(ttile22.$$.fragment, local);
    			transition_out(ttile23.$$.fragment, local);
    			transition_out(ttile24.$$.fragment, local);
    			transition_out(ttile25.$$.fragment, local);
    			transition_out(ttile26.$$.fragment, local);
    			transition_out(ttile27.$$.fragment, local);
    			transition_out(ttile28.$$.fragment, local);
    			transition_out(ttile29.$$.fragment, local);
    			transition_out(ttile30.$$.fragment, local);
    			transition_out(ttile31.$$.fragment, local);
    			transition_out(ttile32.$$.fragment, local);
    			transition_out(ttile33.$$.fragment, local);
    			transition_out(ttile34.$$.fragment, local);
    			transition_out(ttile35.$$.fragment, local);
    			transition_out(ttile36.$$.fragment, local);
    			transition_out(ttile37.$$.fragment, local);
    			transition_out(ttile38.$$.fragment, local);
    			transition_out(ttile39.$$.fragment, local);
    			transition_out(ttile40.$$.fragment, local);
    			transition_out(ttile41.$$.fragment, local);
    			transition_out(ttile42.$$.fragment, local);
    			transition_out(ttile43.$$.fragment, local);
    			transition_out(ttile44.$$.fragment, local);
    			transition_out(ttile45.$$.fragment, local);
    			transition_out(ttile46.$$.fragment, local);
    			transition_out(ttile47.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div12);
    			destroy_component(ttile0);
    			destroy_component(ttile1);
    			destroy_component(ttile2);
    			destroy_component(ttile3);
    			destroy_component(ttile4);
    			destroy_component(ttile5);
    			destroy_component(ttile6);
    			destroy_component(ttile7);
    			destroy_component(ttile8);
    			destroy_component(ttile9);
    			destroy_component(ttile10);
    			destroy_component(ttile11);
    			destroy_component(ttile12);
    			destroy_component(ttile13);
    			destroy_component(ttile14);
    			destroy_component(ttile15);
    			destroy_component(ttile16);
    			destroy_component(ttile17);
    			destroy_component(ttile18);
    			destroy_component(ttile19);
    			destroy_component(ttile20);
    			destroy_component(ttile21);
    			destroy_component(ttile22);
    			destroy_component(ttile23);
    			if (detaching) detach_dev(t58);
    			if (detaching) detach_dev(div24);
    			destroy_component(ttile24);
    			destroy_component(ttile25);
    			destroy_component(ttile26);
    			destroy_component(ttile27);
    			destroy_component(ttile28);
    			destroy_component(ttile29);
    			destroy_component(ttile30);
    			destroy_component(ttile31);
    			destroy_component(ttile32);
    			destroy_component(ttile33);
    			destroy_component(ttile34);
    			destroy_component(ttile35);
    			destroy_component(ttile36);
    			destroy_component(ttile37);
    			destroy_component(ttile38);
    			destroy_component(ttile39);
    			destroy_component(ttile40);
    			destroy_component(ttile41);
    			destroy_component(ttile42);
    			destroy_component(ttile43);
    			destroy_component(ttile44);
    			destroy_component(ttile45);
    			destroy_component(ttile46);
    			destroy_component(ttile47);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const title = "Svelte Tetris";

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Screen', slots, []);
    	const filled = new FilledTile();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Screen> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ FilledTile, Ttile: Tile, title, filled });
    	return [filled];
    }

    class Screen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Screen",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics$1 = function(d, b) {
        extendStatics$1 = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics$1(d, b);
    };

    function __extends$1(d, b) {
        extendStatics$1(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function isFunction$1(x) {
        return typeof x === 'function';
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var _enable_super_gross_mode_that_will_cause_bad_things = false;
    var config = {
        Promise: undefined,
        set useDeprecatedSynchronousErrorHandling(value) {
            if (value) {
                var error = /*@__PURE__*/ new Error();
                /*@__PURE__*/ console.warn('DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n' + error.stack);
            }
            _enable_super_gross_mode_that_will_cause_bad_things = value;
        },
        get useDeprecatedSynchronousErrorHandling() {
            return _enable_super_gross_mode_that_will_cause_bad_things;
        },
    };

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function hostReportError(err) {
        setTimeout(function () { throw err; }, 0);
    }

    /** PURE_IMPORTS_START _config,_util_hostReportError PURE_IMPORTS_END */
    var empty$1 = {
        closed: true,
        next: function (value) { },
        error: function (err) {
            if (config.useDeprecatedSynchronousErrorHandling) {
                throw err;
            }
            else {
                hostReportError(err);
            }
        },
        complete: function () { }
    };

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var isArray$1 = /*@__PURE__*/ (function () { return Array.isArray || (function (x) { return x && typeof x.length === 'number'; }); })();

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function isObject$1(x) {
        return x !== null && typeof x === 'object';
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var UnsubscriptionErrorImpl = /*@__PURE__*/ (function () {
        function UnsubscriptionErrorImpl(errors) {
            Error.call(this);
            this.message = errors ?
                errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ') : '';
            this.name = 'UnsubscriptionError';
            this.errors = errors;
            return this;
        }
        UnsubscriptionErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
        return UnsubscriptionErrorImpl;
    })();
    var UnsubscriptionError = UnsubscriptionErrorImpl;

    /** PURE_IMPORTS_START _util_isArray,_util_isObject,_util_isFunction,_util_UnsubscriptionError PURE_IMPORTS_END */
    var Subscription = /*@__PURE__*/ (function () {
        function Subscription(unsubscribe) {
            this.closed = false;
            this._parentOrParents = null;
            this._subscriptions = null;
            if (unsubscribe) {
                this._ctorUnsubscribe = true;
                this._unsubscribe = unsubscribe;
            }
        }
        Subscription.prototype.unsubscribe = function () {
            var errors;
            if (this.closed) {
                return;
            }
            var _a = this, _parentOrParents = _a._parentOrParents, _ctorUnsubscribe = _a._ctorUnsubscribe, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
            this.closed = true;
            this._parentOrParents = null;
            this._subscriptions = null;
            if (_parentOrParents instanceof Subscription) {
                _parentOrParents.remove(this);
            }
            else if (_parentOrParents !== null) {
                for (var index = 0; index < _parentOrParents.length; ++index) {
                    var parent_1 = _parentOrParents[index];
                    parent_1.remove(this);
                }
            }
            if (isFunction$1(_unsubscribe)) {
                if (_ctorUnsubscribe) {
                    this._unsubscribe = undefined;
                }
                try {
                    _unsubscribe.call(this);
                }
                catch (e) {
                    errors = e instanceof UnsubscriptionError ? flattenUnsubscriptionErrors(e.errors) : [e];
                }
            }
            if (isArray$1(_subscriptions)) {
                var index = -1;
                var len = _subscriptions.length;
                while (++index < len) {
                    var sub = _subscriptions[index];
                    if (isObject$1(sub)) {
                        try {
                            sub.unsubscribe();
                        }
                        catch (e) {
                            errors = errors || [];
                            if (e instanceof UnsubscriptionError) {
                                errors = errors.concat(flattenUnsubscriptionErrors(e.errors));
                            }
                            else {
                                errors.push(e);
                            }
                        }
                    }
                }
            }
            if (errors) {
                throw new UnsubscriptionError(errors);
            }
        };
        Subscription.prototype.add = function (teardown) {
            var subscription = teardown;
            if (!teardown) {
                return Subscription.EMPTY;
            }
            switch (typeof teardown) {
                case 'function':
                    subscription = new Subscription(teardown);
                case 'object':
                    if (subscription === this || subscription.closed || typeof subscription.unsubscribe !== 'function') {
                        return subscription;
                    }
                    else if (this.closed) {
                        subscription.unsubscribe();
                        return subscription;
                    }
                    else if (!(subscription instanceof Subscription)) {
                        var tmp = subscription;
                        subscription = new Subscription();
                        subscription._subscriptions = [tmp];
                    }
                    break;
                default: {
                    throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
                }
            }
            var _parentOrParents = subscription._parentOrParents;
            if (_parentOrParents === null) {
                subscription._parentOrParents = this;
            }
            else if (_parentOrParents instanceof Subscription) {
                if (_parentOrParents === this) {
                    return subscription;
                }
                subscription._parentOrParents = [_parentOrParents, this];
            }
            else if (_parentOrParents.indexOf(this) === -1) {
                _parentOrParents.push(this);
            }
            else {
                return subscription;
            }
            var subscriptions = this._subscriptions;
            if (subscriptions === null) {
                this._subscriptions = [subscription];
            }
            else {
                subscriptions.push(subscription);
            }
            return subscription;
        };
        Subscription.prototype.remove = function (subscription) {
            var subscriptions = this._subscriptions;
            if (subscriptions) {
                var subscriptionIndex = subscriptions.indexOf(subscription);
                if (subscriptionIndex !== -1) {
                    subscriptions.splice(subscriptionIndex, 1);
                }
            }
        };
        Subscription.EMPTY = (function (empty) {
            empty.closed = true;
            return empty;
        }(new Subscription()));
        return Subscription;
    }());
    function flattenUnsubscriptionErrors(errors) {
        return errors.reduce(function (errs, err) { return errs.concat((err instanceof UnsubscriptionError) ? err.errors : err); }, []);
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var rxSubscriber = /*@__PURE__*/ (function () {
        return typeof Symbol === 'function'
            ? /*@__PURE__*/ Symbol('rxSubscriber')
            : '@@rxSubscriber_' + /*@__PURE__*/ Math.random();
    })();

    /** PURE_IMPORTS_START tslib,_util_isFunction,_Observer,_Subscription,_internal_symbol_rxSubscriber,_config,_util_hostReportError PURE_IMPORTS_END */
    var Subscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(Subscriber, _super);
        function Subscriber(destinationOrNext, error, complete) {
            var _this = _super.call(this) || this;
            _this.syncErrorValue = null;
            _this.syncErrorThrown = false;
            _this.syncErrorThrowable = false;
            _this.isStopped = false;
            switch (arguments.length) {
                case 0:
                    _this.destination = empty$1;
                    break;
                case 1:
                    if (!destinationOrNext) {
                        _this.destination = empty$1;
                        break;
                    }
                    if (typeof destinationOrNext === 'object') {
                        if (destinationOrNext instanceof Subscriber) {
                            _this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
                            _this.destination = destinationOrNext;
                            destinationOrNext.add(_this);
                        }
                        else {
                            _this.syncErrorThrowable = true;
                            _this.destination = new SafeSubscriber(_this, destinationOrNext);
                        }
                        break;
                    }
                default:
                    _this.syncErrorThrowable = true;
                    _this.destination = new SafeSubscriber(_this, destinationOrNext, error, complete);
                    break;
            }
            return _this;
        }
        Subscriber.prototype[rxSubscriber] = function () { return this; };
        Subscriber.create = function (next, error, complete) {
            var subscriber = new Subscriber(next, error, complete);
            subscriber.syncErrorThrowable = false;
            return subscriber;
        };
        Subscriber.prototype.next = function (value) {
            if (!this.isStopped) {
                this._next(value);
            }
        };
        Subscriber.prototype.error = function (err) {
            if (!this.isStopped) {
                this.isStopped = true;
                this._error(err);
            }
        };
        Subscriber.prototype.complete = function () {
            if (!this.isStopped) {
                this.isStopped = true;
                this._complete();
            }
        };
        Subscriber.prototype.unsubscribe = function () {
            if (this.closed) {
                return;
            }
            this.isStopped = true;
            _super.prototype.unsubscribe.call(this);
        };
        Subscriber.prototype._next = function (value) {
            this.destination.next(value);
        };
        Subscriber.prototype._error = function (err) {
            this.destination.error(err);
            this.unsubscribe();
        };
        Subscriber.prototype._complete = function () {
            this.destination.complete();
            this.unsubscribe();
        };
        Subscriber.prototype._unsubscribeAndRecycle = function () {
            var _parentOrParents = this._parentOrParents;
            this._parentOrParents = null;
            this.unsubscribe();
            this.closed = false;
            this.isStopped = false;
            this._parentOrParents = _parentOrParents;
            return this;
        };
        return Subscriber;
    }(Subscription));
    var SafeSubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(SafeSubscriber, _super);
        function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
            var _this = _super.call(this) || this;
            _this._parentSubscriber = _parentSubscriber;
            var next;
            var context = _this;
            if (isFunction$1(observerOrNext)) {
                next = observerOrNext;
            }
            else if (observerOrNext) {
                next = observerOrNext.next;
                error = observerOrNext.error;
                complete = observerOrNext.complete;
                if (observerOrNext !== empty$1) {
                    context = Object.create(observerOrNext);
                    if (isFunction$1(context.unsubscribe)) {
                        _this.add(context.unsubscribe.bind(context));
                    }
                    context.unsubscribe = _this.unsubscribe.bind(_this);
                }
            }
            _this._context = context;
            _this._next = next;
            _this._error = error;
            _this._complete = complete;
            return _this;
        }
        SafeSubscriber.prototype.next = function (value) {
            if (!this.isStopped && this._next) {
                var _parentSubscriber = this._parentSubscriber;
                if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(this._next, value);
                }
                else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.error = function (err) {
            if (!this.isStopped) {
                var _parentSubscriber = this._parentSubscriber;
                var useDeprecatedSynchronousErrorHandling = config.useDeprecatedSynchronousErrorHandling;
                if (this._error) {
                    if (!useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                        this.__tryOrUnsub(this._error, err);
                        this.unsubscribe();
                    }
                    else {
                        this.__tryOrSetError(_parentSubscriber, this._error, err);
                        this.unsubscribe();
                    }
                }
                else if (!_parentSubscriber.syncErrorThrowable) {
                    this.unsubscribe();
                    if (useDeprecatedSynchronousErrorHandling) {
                        throw err;
                    }
                    hostReportError(err);
                }
                else {
                    if (useDeprecatedSynchronousErrorHandling) {
                        _parentSubscriber.syncErrorValue = err;
                        _parentSubscriber.syncErrorThrown = true;
                    }
                    else {
                        hostReportError(err);
                    }
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.complete = function () {
            var _this = this;
            if (!this.isStopped) {
                var _parentSubscriber = this._parentSubscriber;
                if (this._complete) {
                    var wrappedComplete = function () { return _this._complete.call(_this._context); };
                    if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                        this.__tryOrUnsub(wrappedComplete);
                        this.unsubscribe();
                    }
                    else {
                        this.__tryOrSetError(_parentSubscriber, wrappedComplete);
                        this.unsubscribe();
                    }
                }
                else {
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
            try {
                fn.call(this._context, value);
            }
            catch (err) {
                this.unsubscribe();
                if (config.useDeprecatedSynchronousErrorHandling) {
                    throw err;
                }
                else {
                    hostReportError(err);
                }
            }
        };
        SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
            if (!config.useDeprecatedSynchronousErrorHandling) {
                throw new Error('bad call');
            }
            try {
                fn.call(this._context, value);
            }
            catch (err) {
                if (config.useDeprecatedSynchronousErrorHandling) {
                    parent.syncErrorValue = err;
                    parent.syncErrorThrown = true;
                    return true;
                }
                else {
                    hostReportError(err);
                    return true;
                }
            }
            return false;
        };
        SafeSubscriber.prototype._unsubscribe = function () {
            var _parentSubscriber = this._parentSubscriber;
            this._context = null;
            this._parentSubscriber = null;
            _parentSubscriber.unsubscribe();
        };
        return SafeSubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START _Subscriber PURE_IMPORTS_END */
    function canReportError(observer) {
        while (observer) {
            var _a = observer, closed_1 = _a.closed, destination = _a.destination, isStopped = _a.isStopped;
            if (closed_1 || isStopped) {
                return false;
            }
            else if (destination && destination instanceof Subscriber) {
                observer = destination;
            }
            else {
                observer = null;
            }
        }
        return true;
    }

    /** PURE_IMPORTS_START _Subscriber,_symbol_rxSubscriber,_Observer PURE_IMPORTS_END */
    function toSubscriber(nextOrObserver, error, complete) {
        if (nextOrObserver) {
            if (nextOrObserver instanceof Subscriber) {
                return nextOrObserver;
            }
            if (nextOrObserver[rxSubscriber]) {
                return nextOrObserver[rxSubscriber]();
            }
        }
        if (!nextOrObserver && !error && !complete) {
            return new Subscriber(empty$1);
        }
        return new Subscriber(nextOrObserver, error, complete);
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var observable = /*@__PURE__*/ (function () { return typeof Symbol === 'function' && Symbol.observable || '@@observable'; })();

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function identity(x) {
        return x;
    }

    /** PURE_IMPORTS_START _identity PURE_IMPORTS_END */
    function pipeFromArray(fns) {
        if (fns.length === 0) {
            return identity;
        }
        if (fns.length === 1) {
            return fns[0];
        }
        return function piped(input) {
            return fns.reduce(function (prev, fn) { return fn(prev); }, input);
        };
    }

    /** PURE_IMPORTS_START _util_canReportError,_util_toSubscriber,_symbol_observable,_util_pipe,_config PURE_IMPORTS_END */
    var Observable = /*@__PURE__*/ (function () {
        function Observable(subscribe) {
            this._isScalar = false;
            if (subscribe) {
                this._subscribe = subscribe;
            }
        }
        Observable.prototype.lift = function (operator) {
            var observable = new Observable();
            observable.source = this;
            observable.operator = operator;
            return observable;
        };
        Observable.prototype.subscribe = function (observerOrNext, error, complete) {
            var operator = this.operator;
            var sink = toSubscriber(observerOrNext, error, complete);
            if (operator) {
                sink.add(operator.call(sink, this.source));
            }
            else {
                sink.add(this.source || (config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable) ?
                    this._subscribe(sink) :
                    this._trySubscribe(sink));
            }
            if (config.useDeprecatedSynchronousErrorHandling) {
                if (sink.syncErrorThrowable) {
                    sink.syncErrorThrowable = false;
                    if (sink.syncErrorThrown) {
                        throw sink.syncErrorValue;
                    }
                }
            }
            return sink;
        };
        Observable.prototype._trySubscribe = function (sink) {
            try {
                return this._subscribe(sink);
            }
            catch (err) {
                if (config.useDeprecatedSynchronousErrorHandling) {
                    sink.syncErrorThrown = true;
                    sink.syncErrorValue = err;
                }
                if (canReportError(sink)) {
                    sink.error(err);
                }
                else {
                    console.warn(err);
                }
            }
        };
        Observable.prototype.forEach = function (next, promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var subscription;
                subscription = _this.subscribe(function (value) {
                    try {
                        next(value);
                    }
                    catch (err) {
                        reject(err);
                        if (subscription) {
                            subscription.unsubscribe();
                        }
                    }
                }, reject, resolve);
            });
        };
        Observable.prototype._subscribe = function (subscriber) {
            var source = this.source;
            return source && source.subscribe(subscriber);
        };
        Observable.prototype[observable] = function () {
            return this;
        };
        Observable.prototype.pipe = function () {
            var operations = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                operations[_i] = arguments[_i];
            }
            if (operations.length === 0) {
                return this;
            }
            return pipeFromArray(operations)(this);
        };
        Observable.prototype.toPromise = function (promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var value;
                _this.subscribe(function (x) { return value = x; }, function (err) { return reject(err); }, function () { return resolve(value); });
            });
        };
        Observable.create = function (subscribe) {
            return new Observable(subscribe);
        };
        return Observable;
    }());
    function getPromiseCtor(promiseCtor) {
        if (!promiseCtor) {
            promiseCtor = config.Promise || Promise;
        }
        if (!promiseCtor) {
            throw new Error('no Promise impl found');
        }
        return promiseCtor;
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var ObjectUnsubscribedErrorImpl = /*@__PURE__*/ (function () {
        function ObjectUnsubscribedErrorImpl() {
            Error.call(this);
            this.message = 'object unsubscribed';
            this.name = 'ObjectUnsubscribedError';
            return this;
        }
        ObjectUnsubscribedErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
        return ObjectUnsubscribedErrorImpl;
    })();
    var ObjectUnsubscribedError = ObjectUnsubscribedErrorImpl;

    /** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */
    var SubjectSubscription = /*@__PURE__*/ (function (_super) {
        __extends$1(SubjectSubscription, _super);
        function SubjectSubscription(subject, subscriber) {
            var _this = _super.call(this) || this;
            _this.subject = subject;
            _this.subscriber = subscriber;
            _this.closed = false;
            return _this;
        }
        SubjectSubscription.prototype.unsubscribe = function () {
            if (this.closed) {
                return;
            }
            this.closed = true;
            var subject = this.subject;
            var observers = subject.observers;
            this.subject = null;
            if (!observers || observers.length === 0 || subject.isStopped || subject.closed) {
                return;
            }
            var subscriberIndex = observers.indexOf(this.subscriber);
            if (subscriberIndex !== -1) {
                observers.splice(subscriberIndex, 1);
            }
        };
        return SubjectSubscription;
    }(Subscription));

    /** PURE_IMPORTS_START tslib,_Observable,_Subscriber,_Subscription,_util_ObjectUnsubscribedError,_SubjectSubscription,_internal_symbol_rxSubscriber PURE_IMPORTS_END */
    var SubjectSubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(SubjectSubscriber, _super);
        function SubjectSubscriber(destination) {
            var _this = _super.call(this, destination) || this;
            _this.destination = destination;
            return _this;
        }
        return SubjectSubscriber;
    }(Subscriber));
    var Subject = /*@__PURE__*/ (function (_super) {
        __extends$1(Subject, _super);
        function Subject() {
            var _this = _super.call(this) || this;
            _this.observers = [];
            _this.closed = false;
            _this.isStopped = false;
            _this.hasError = false;
            _this.thrownError = null;
            return _this;
        }
        Subject.prototype[rxSubscriber] = function () {
            return new SubjectSubscriber(this);
        };
        Subject.prototype.lift = function (operator) {
            var subject = new AnonymousSubject(this, this);
            subject.operator = operator;
            return subject;
        };
        Subject.prototype.next = function (value) {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            if (!this.isStopped) {
                var observers = this.observers;
                var len = observers.length;
                var copy = observers.slice();
                for (var i = 0; i < len; i++) {
                    copy[i].next(value);
                }
            }
        };
        Subject.prototype.error = function (err) {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            this.hasError = true;
            this.thrownError = err;
            this.isStopped = true;
            var observers = this.observers;
            var len = observers.length;
            var copy = observers.slice();
            for (var i = 0; i < len; i++) {
                copy[i].error(err);
            }
            this.observers.length = 0;
        };
        Subject.prototype.complete = function () {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            this.isStopped = true;
            var observers = this.observers;
            var len = observers.length;
            var copy = observers.slice();
            for (var i = 0; i < len; i++) {
                copy[i].complete();
            }
            this.observers.length = 0;
        };
        Subject.prototype.unsubscribe = function () {
            this.isStopped = true;
            this.closed = true;
            this.observers = null;
        };
        Subject.prototype._trySubscribe = function (subscriber) {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            else {
                return _super.prototype._trySubscribe.call(this, subscriber);
            }
        };
        Subject.prototype._subscribe = function (subscriber) {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            else if (this.hasError) {
                subscriber.error(this.thrownError);
                return Subscription.EMPTY;
            }
            else if (this.isStopped) {
                subscriber.complete();
                return Subscription.EMPTY;
            }
            else {
                this.observers.push(subscriber);
                return new SubjectSubscription(this, subscriber);
            }
        };
        Subject.prototype.asObservable = function () {
            var observable = new Observable();
            observable.source = this;
            return observable;
        };
        Subject.create = function (destination, source) {
            return new AnonymousSubject(destination, source);
        };
        return Subject;
    }(Observable));
    var AnonymousSubject = /*@__PURE__*/ (function (_super) {
        __extends$1(AnonymousSubject, _super);
        function AnonymousSubject(destination, source) {
            var _this = _super.call(this) || this;
            _this.destination = destination;
            _this.source = source;
            return _this;
        }
        AnonymousSubject.prototype.next = function (value) {
            var destination = this.destination;
            if (destination && destination.next) {
                destination.next(value);
            }
        };
        AnonymousSubject.prototype.error = function (err) {
            var destination = this.destination;
            if (destination && destination.error) {
                this.destination.error(err);
            }
        };
        AnonymousSubject.prototype.complete = function () {
            var destination = this.destination;
            if (destination && destination.complete) {
                this.destination.complete();
            }
        };
        AnonymousSubject.prototype._subscribe = function (subscriber) {
            var source = this.source;
            if (source) {
                return this.source.subscribe(subscriber);
            }
            else {
                return Subscription.EMPTY;
            }
        };
        return AnonymousSubject;
    }(Subject));

    /** PURE_IMPORTS_START tslib,_Subject,_util_ObjectUnsubscribedError PURE_IMPORTS_END */
    var BehaviorSubject = /*@__PURE__*/ (function (_super) {
        __extends$1(BehaviorSubject, _super);
        function BehaviorSubject(_value) {
            var _this = _super.call(this) || this;
            _this._value = _value;
            return _this;
        }
        Object.defineProperty(BehaviorSubject.prototype, "value", {
            get: function () {
                return this.getValue();
            },
            enumerable: true,
            configurable: true
        });
        BehaviorSubject.prototype._subscribe = function (subscriber) {
            var subscription = _super.prototype._subscribe.call(this, subscriber);
            if (subscription && !subscription.closed) {
                subscriber.next(this._value);
            }
            return subscription;
        };
        BehaviorSubject.prototype.getValue = function () {
            if (this.hasError) {
                throw this.thrownError;
            }
            else if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            else {
                return this._value;
            }
        };
        BehaviorSubject.prototype.next = function (value) {
            _super.prototype.next.call(this, this._value = value);
        };
        return BehaviorSubject;
    }(Subject));

    /** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */
    var Action = /*@__PURE__*/ (function (_super) {
        __extends$1(Action, _super);
        function Action(scheduler, work) {
            return _super.call(this) || this;
        }
        Action.prototype.schedule = function (state, delay) {
            return this;
        };
        return Action;
    }(Subscription));

    /** PURE_IMPORTS_START tslib,_Action PURE_IMPORTS_END */
    var AsyncAction = /*@__PURE__*/ (function (_super) {
        __extends$1(AsyncAction, _super);
        function AsyncAction(scheduler, work) {
            var _this = _super.call(this, scheduler, work) || this;
            _this.scheduler = scheduler;
            _this.work = work;
            _this.pending = false;
            return _this;
        }
        AsyncAction.prototype.schedule = function (state, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            if (this.closed) {
                return this;
            }
            this.state = state;
            var id = this.id;
            var scheduler = this.scheduler;
            if (id != null) {
                this.id = this.recycleAsyncId(scheduler, id, delay);
            }
            this.pending = true;
            this.delay = delay;
            this.id = this.id || this.requestAsyncId(scheduler, this.id, delay);
            return this;
        };
        AsyncAction.prototype.requestAsyncId = function (scheduler, id, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            return setInterval(scheduler.flush.bind(scheduler, this), delay);
        };
        AsyncAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            if (delay !== null && this.delay === delay && this.pending === false) {
                return id;
            }
            clearInterval(id);
            return undefined;
        };
        AsyncAction.prototype.execute = function (state, delay) {
            if (this.closed) {
                return new Error('executing a cancelled action');
            }
            this.pending = false;
            var error = this._execute(state, delay);
            if (error) {
                return error;
            }
            else if (this.pending === false && this.id != null) {
                this.id = this.recycleAsyncId(this.scheduler, this.id, null);
            }
        };
        AsyncAction.prototype._execute = function (state, delay) {
            var errored = false;
            var errorValue = undefined;
            try {
                this.work(state);
            }
            catch (e) {
                errored = true;
                errorValue = !!e && e || new Error(e);
            }
            if (errored) {
                this.unsubscribe();
                return errorValue;
            }
        };
        AsyncAction.prototype._unsubscribe = function () {
            var id = this.id;
            var scheduler = this.scheduler;
            var actions = scheduler.actions;
            var index = actions.indexOf(this);
            this.work = null;
            this.state = null;
            this.pending = false;
            this.scheduler = null;
            if (index !== -1) {
                actions.splice(index, 1);
            }
            if (id != null) {
                this.id = this.recycleAsyncId(scheduler, id, null);
            }
            this.delay = null;
        };
        return AsyncAction;
    }(Action));

    /** PURE_IMPORTS_START tslib,_AsyncAction PURE_IMPORTS_END */
    var QueueAction = /*@__PURE__*/ (function (_super) {
        __extends$1(QueueAction, _super);
        function QueueAction(scheduler, work) {
            var _this = _super.call(this, scheduler, work) || this;
            _this.scheduler = scheduler;
            _this.work = work;
            return _this;
        }
        QueueAction.prototype.schedule = function (state, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            if (delay > 0) {
                return _super.prototype.schedule.call(this, state, delay);
            }
            this.delay = delay;
            this.state = state;
            this.scheduler.flush(this);
            return this;
        };
        QueueAction.prototype.execute = function (state, delay) {
            return (delay > 0 || this.closed) ?
                _super.prototype.execute.call(this, state, delay) :
                this._execute(state, delay);
        };
        QueueAction.prototype.requestAsyncId = function (scheduler, id, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            if ((delay !== null && delay > 0) || (delay === null && this.delay > 0)) {
                return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
            }
            return scheduler.flush(this);
        };
        return QueueAction;
    }(AsyncAction));

    var Scheduler = /*@__PURE__*/ (function () {
        function Scheduler(SchedulerAction, now) {
            if (now === void 0) {
                now = Scheduler.now;
            }
            this.SchedulerAction = SchedulerAction;
            this.now = now;
        }
        Scheduler.prototype.schedule = function (work, delay, state) {
            if (delay === void 0) {
                delay = 0;
            }
            return new this.SchedulerAction(this, work).schedule(state, delay);
        };
        Scheduler.now = function () { return Date.now(); };
        return Scheduler;
    }());

    /** PURE_IMPORTS_START tslib,_Scheduler PURE_IMPORTS_END */
    var AsyncScheduler = /*@__PURE__*/ (function (_super) {
        __extends$1(AsyncScheduler, _super);
        function AsyncScheduler(SchedulerAction, now) {
            if (now === void 0) {
                now = Scheduler.now;
            }
            var _this = _super.call(this, SchedulerAction, function () {
                if (AsyncScheduler.delegate && AsyncScheduler.delegate !== _this) {
                    return AsyncScheduler.delegate.now();
                }
                else {
                    return now();
                }
            }) || this;
            _this.actions = [];
            _this.active = false;
            _this.scheduled = undefined;
            return _this;
        }
        AsyncScheduler.prototype.schedule = function (work, delay, state) {
            if (delay === void 0) {
                delay = 0;
            }
            if (AsyncScheduler.delegate && AsyncScheduler.delegate !== this) {
                return AsyncScheduler.delegate.schedule(work, delay, state);
            }
            else {
                return _super.prototype.schedule.call(this, work, delay, state);
            }
        };
        AsyncScheduler.prototype.flush = function (action) {
            var actions = this.actions;
            if (this.active) {
                actions.push(action);
                return;
            }
            var error;
            this.active = true;
            do {
                if (error = action.execute(action.state, action.delay)) {
                    break;
                }
            } while (action = actions.shift());
            this.active = false;
            if (error) {
                while (action = actions.shift()) {
                    action.unsubscribe();
                }
                throw error;
            }
        };
        return AsyncScheduler;
    }(Scheduler));

    /** PURE_IMPORTS_START tslib,_AsyncScheduler PURE_IMPORTS_END */
    var QueueScheduler = /*@__PURE__*/ (function (_super) {
        __extends$1(QueueScheduler, _super);
        function QueueScheduler() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return QueueScheduler;
    }(AsyncScheduler));

    /** PURE_IMPORTS_START _QueueAction,_QueueScheduler PURE_IMPORTS_END */
    var queueScheduler = /*@__PURE__*/ new QueueScheduler(QueueAction);
    var queue = queueScheduler;

    /** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */
    var EMPTY = /*@__PURE__*/ new Observable(function (subscriber) { return subscriber.complete(); });
    function empty(scheduler) {
        return scheduler ? emptyScheduled(scheduler) : EMPTY;
    }
    function emptyScheduled(scheduler) {
        return new Observable(function (subscriber) { return scheduler.schedule(function () { return subscriber.complete(); }); });
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function isScheduler(value) {
        return value && typeof value.schedule === 'function';
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var subscribeToArray = function (array) {
        return function (subscriber) {
            for (var i = 0, len = array.length; i < len && !subscriber.closed; i++) {
                subscriber.next(array[i]);
            }
            subscriber.complete();
        };
    };

    /** PURE_IMPORTS_START _Observable,_Subscription PURE_IMPORTS_END */
    function scheduleArray(input, scheduler) {
        return new Observable(function (subscriber) {
            var sub = new Subscription();
            var i = 0;
            sub.add(scheduler.schedule(function () {
                if (i === input.length) {
                    subscriber.complete();
                    return;
                }
                subscriber.next(input[i++]);
                if (!subscriber.closed) {
                    sub.add(this.schedule());
                }
            }));
            return sub;
        });
    }

    /** PURE_IMPORTS_START _Observable,_util_subscribeToArray,_scheduled_scheduleArray PURE_IMPORTS_END */
    function fromArray(input, scheduler) {
        if (!scheduler) {
            return new Observable(subscribeToArray(input));
        }
        else {
            return scheduleArray(input, scheduler);
        }
    }

    /** PURE_IMPORTS_START _util_isScheduler,_fromArray,_scheduled_scheduleArray PURE_IMPORTS_END */
    function of() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var scheduler = args[args.length - 1];
        if (isScheduler(scheduler)) {
            args.pop();
            return scheduleArray(args, scheduler);
        }
        else {
            return fromArray(args);
        }
    }

    /** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */
    function throwError(error, scheduler) {
        if (!scheduler) {
            return new Observable(function (subscriber) { return subscriber.error(error); });
        }
        else {
            return new Observable(function (subscriber) { return scheduler.schedule(dispatch$2, 0, { error: error, subscriber: subscriber }); });
        }
    }
    function dispatch$2(_a) {
        var error = _a.error, subscriber = _a.subscriber;
        subscriber.error(error);
    }

    /** PURE_IMPORTS_START _observable_empty,_observable_of,_observable_throwError PURE_IMPORTS_END */
    var Notification = /*@__PURE__*/ (function () {
        function Notification(kind, value, error) {
            this.kind = kind;
            this.value = value;
            this.error = error;
            this.hasValue = kind === 'N';
        }
        Notification.prototype.observe = function (observer) {
            switch (this.kind) {
                case 'N':
                    return observer.next && observer.next(this.value);
                case 'E':
                    return observer.error && observer.error(this.error);
                case 'C':
                    return observer.complete && observer.complete();
            }
        };
        Notification.prototype.do = function (next, error, complete) {
            var kind = this.kind;
            switch (kind) {
                case 'N':
                    return next && next(this.value);
                case 'E':
                    return error && error(this.error);
                case 'C':
                    return complete && complete();
            }
        };
        Notification.prototype.accept = function (nextOrObserver, error, complete) {
            if (nextOrObserver && typeof nextOrObserver.next === 'function') {
                return this.observe(nextOrObserver);
            }
            else {
                return this.do(nextOrObserver, error, complete);
            }
        };
        Notification.prototype.toObservable = function () {
            var kind = this.kind;
            switch (kind) {
                case 'N':
                    return of(this.value);
                case 'E':
                    return throwError(this.error);
                case 'C':
                    return empty();
            }
            throw new Error('unexpected notification kind value');
        };
        Notification.createNext = function (value) {
            if (typeof value !== 'undefined') {
                return new Notification('N', value);
            }
            return Notification.undefinedValueNotification;
        };
        Notification.createError = function (err) {
            return new Notification('E', undefined, err);
        };
        Notification.createComplete = function () {
            return Notification.completeNotification;
        };
        Notification.completeNotification = new Notification('C');
        Notification.undefinedValueNotification = new Notification('N', undefined);
        return Notification;
    }());

    /** PURE_IMPORTS_START tslib,_Subscriber,_Notification PURE_IMPORTS_END */
    var ObserveOnSubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(ObserveOnSubscriber, _super);
        function ObserveOnSubscriber(destination, scheduler, delay) {
            if (delay === void 0) {
                delay = 0;
            }
            var _this = _super.call(this, destination) || this;
            _this.scheduler = scheduler;
            _this.delay = delay;
            return _this;
        }
        ObserveOnSubscriber.dispatch = function (arg) {
            var notification = arg.notification, destination = arg.destination;
            notification.observe(destination);
            this.unsubscribe();
        };
        ObserveOnSubscriber.prototype.scheduleMessage = function (notification) {
            var destination = this.destination;
            destination.add(this.scheduler.schedule(ObserveOnSubscriber.dispatch, this.delay, new ObserveOnMessage(notification, this.destination)));
        };
        ObserveOnSubscriber.prototype._next = function (value) {
            this.scheduleMessage(Notification.createNext(value));
        };
        ObserveOnSubscriber.prototype._error = function (err) {
            this.scheduleMessage(Notification.createError(err));
            this.unsubscribe();
        };
        ObserveOnSubscriber.prototype._complete = function () {
            this.scheduleMessage(Notification.createComplete());
            this.unsubscribe();
        };
        return ObserveOnSubscriber;
    }(Subscriber));
    var ObserveOnMessage = /*@__PURE__*/ (function () {
        function ObserveOnMessage(notification, destination) {
            this.notification = notification;
            this.destination = destination;
        }
        return ObserveOnMessage;
    }());

    /** PURE_IMPORTS_START tslib,_Subject,_scheduler_queue,_Subscription,_operators_observeOn,_util_ObjectUnsubscribedError,_SubjectSubscription PURE_IMPORTS_END */
    var ReplaySubject = /*@__PURE__*/ (function (_super) {
        __extends$1(ReplaySubject, _super);
        function ReplaySubject(bufferSize, windowTime, scheduler) {
            if (bufferSize === void 0) {
                bufferSize = Number.POSITIVE_INFINITY;
            }
            if (windowTime === void 0) {
                windowTime = Number.POSITIVE_INFINITY;
            }
            var _this = _super.call(this) || this;
            _this.scheduler = scheduler;
            _this._events = [];
            _this._infiniteTimeWindow = false;
            _this._bufferSize = bufferSize < 1 ? 1 : bufferSize;
            _this._windowTime = windowTime < 1 ? 1 : windowTime;
            if (windowTime === Number.POSITIVE_INFINITY) {
                _this._infiniteTimeWindow = true;
                _this.next = _this.nextInfiniteTimeWindow;
            }
            else {
                _this.next = _this.nextTimeWindow;
            }
            return _this;
        }
        ReplaySubject.prototype.nextInfiniteTimeWindow = function (value) {
            if (!this.isStopped) {
                var _events = this._events;
                _events.push(value);
                if (_events.length > this._bufferSize) {
                    _events.shift();
                }
            }
            _super.prototype.next.call(this, value);
        };
        ReplaySubject.prototype.nextTimeWindow = function (value) {
            if (!this.isStopped) {
                this._events.push(new ReplayEvent(this._getNow(), value));
                this._trimBufferThenGetEvents();
            }
            _super.prototype.next.call(this, value);
        };
        ReplaySubject.prototype._subscribe = function (subscriber) {
            var _infiniteTimeWindow = this._infiniteTimeWindow;
            var _events = _infiniteTimeWindow ? this._events : this._trimBufferThenGetEvents();
            var scheduler = this.scheduler;
            var len = _events.length;
            var subscription;
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
            else if (this.isStopped || this.hasError) {
                subscription = Subscription.EMPTY;
            }
            else {
                this.observers.push(subscriber);
                subscription = new SubjectSubscription(this, subscriber);
            }
            if (scheduler) {
                subscriber.add(subscriber = new ObserveOnSubscriber(subscriber, scheduler));
            }
            if (_infiniteTimeWindow) {
                for (var i = 0; i < len && !subscriber.closed; i++) {
                    subscriber.next(_events[i]);
                }
            }
            else {
                for (var i = 0; i < len && !subscriber.closed; i++) {
                    subscriber.next(_events[i].value);
                }
            }
            if (this.hasError) {
                subscriber.error(this.thrownError);
            }
            else if (this.isStopped) {
                subscriber.complete();
            }
            return subscription;
        };
        ReplaySubject.prototype._getNow = function () {
            return (this.scheduler || queue).now();
        };
        ReplaySubject.prototype._trimBufferThenGetEvents = function () {
            var now = this._getNow();
            var _bufferSize = this._bufferSize;
            var _windowTime = this._windowTime;
            var _events = this._events;
            var eventsCount = _events.length;
            var spliceCount = 0;
            while (spliceCount < eventsCount) {
                if ((now - _events[spliceCount].time) < _windowTime) {
                    break;
                }
                spliceCount++;
            }
            if (eventsCount > _bufferSize) {
                spliceCount = Math.max(spliceCount, eventsCount - _bufferSize);
            }
            if (spliceCount > 0) {
                _events.splice(0, spliceCount);
            }
            return _events;
        };
        return ReplaySubject;
    }(Subject));
    var ReplayEvent = /*@__PURE__*/ (function () {
        function ReplayEvent(time, value) {
            this.time = time;
            this.value = value;
        }
        return ReplayEvent;
    }());

    /** PURE_IMPORTS_START _AsyncAction,_AsyncScheduler PURE_IMPORTS_END */
    var asyncScheduler = /*@__PURE__*/ new AsyncScheduler(AsyncAction);
    var async = asyncScheduler;

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function noop() { }

    /** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */
    function isObservable(obj) {
        return !!obj && (obj instanceof Observable || (typeof obj.lift === 'function' && typeof obj.subscribe === 'function'));
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var ArgumentOutOfRangeErrorImpl = /*@__PURE__*/ (function () {
        function ArgumentOutOfRangeErrorImpl() {
            Error.call(this);
            this.message = 'argument out of range';
            this.name = 'ArgumentOutOfRangeError';
            return this;
        }
        ArgumentOutOfRangeErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
        return ArgumentOutOfRangeErrorImpl;
    })();
    var ArgumentOutOfRangeError = ArgumentOutOfRangeErrorImpl;

    /** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
    function map(project, thisArg) {
        return function mapOperation(source) {
            if (typeof project !== 'function') {
                throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
            }
            return source.lift(new MapOperator(project, thisArg));
        };
    }
    var MapOperator = /*@__PURE__*/ (function () {
        function MapOperator(project, thisArg) {
            this.project = project;
            this.thisArg = thisArg;
        }
        MapOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));
        };
        return MapOperator;
    }());
    var MapSubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(MapSubscriber, _super);
        function MapSubscriber(destination, project, thisArg) {
            var _this = _super.call(this, destination) || this;
            _this.project = project;
            _this.count = 0;
            _this.thisArg = thisArg || _this;
            return _this;
        }
        MapSubscriber.prototype._next = function (value) {
            var result;
            try {
                result = this.project.call(this.thisArg, value, this.count++);
            }
            catch (err) {
                this.destination.error(err);
                return;
            }
            this.destination.next(result);
        };
        return MapSubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
    var OuterSubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(OuterSubscriber, _super);
        function OuterSubscriber() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        OuterSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
            this.destination.next(innerValue);
        };
        OuterSubscriber.prototype.notifyError = function (error, innerSub) {
            this.destination.error(error);
        };
        OuterSubscriber.prototype.notifyComplete = function (innerSub) {
            this.destination.complete();
        };
        return OuterSubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
    var InnerSubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(InnerSubscriber, _super);
        function InnerSubscriber(parent, outerValue, outerIndex) {
            var _this = _super.call(this) || this;
            _this.parent = parent;
            _this.outerValue = outerValue;
            _this.outerIndex = outerIndex;
            _this.index = 0;
            return _this;
        }
        InnerSubscriber.prototype._next = function (value) {
            this.parent.notifyNext(this.outerValue, value, this.outerIndex, this.index++, this);
        };
        InnerSubscriber.prototype._error = function (error) {
            this.parent.notifyError(error, this);
            this.unsubscribe();
        };
        InnerSubscriber.prototype._complete = function () {
            this.parent.notifyComplete(this);
            this.unsubscribe();
        };
        return InnerSubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START _hostReportError PURE_IMPORTS_END */
    var subscribeToPromise = function (promise) {
        return function (subscriber) {
            promise.then(function (value) {
                if (!subscriber.closed) {
                    subscriber.next(value);
                    subscriber.complete();
                }
            }, function (err) { return subscriber.error(err); })
                .then(null, hostReportError);
            return subscriber;
        };
    };

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function getSymbolIterator() {
        if (typeof Symbol !== 'function' || !Symbol.iterator) {
            return '@@iterator';
        }
        return Symbol.iterator;
    }
    var iterator = /*@__PURE__*/ getSymbolIterator();

    /** PURE_IMPORTS_START _symbol_iterator PURE_IMPORTS_END */
    var subscribeToIterable = function (iterable) {
        return function (subscriber) {
            var iterator$1 = iterable[iterator]();
            do {
                var item = void 0;
                try {
                    item = iterator$1.next();
                }
                catch (err) {
                    subscriber.error(err);
                    return subscriber;
                }
                if (item.done) {
                    subscriber.complete();
                    break;
                }
                subscriber.next(item.value);
                if (subscriber.closed) {
                    break;
                }
            } while (true);
            if (typeof iterator$1.return === 'function') {
                subscriber.add(function () {
                    if (iterator$1.return) {
                        iterator$1.return();
                    }
                });
            }
            return subscriber;
        };
    };

    /** PURE_IMPORTS_START _symbol_observable PURE_IMPORTS_END */
    var subscribeToObservable = function (obj) {
        return function (subscriber) {
            var obs = obj[observable]();
            if (typeof obs.subscribe !== 'function') {
                throw new TypeError('Provided object does not correctly implement Symbol.observable');
            }
            else {
                return obs.subscribe(subscriber);
            }
        };
    };

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var isArrayLike = (function (x) { return x && typeof x.length === 'number' && typeof x !== 'function'; });

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function isPromise$1(value) {
        return !!value && typeof value.subscribe !== 'function' && typeof value.then === 'function';
    }

    /** PURE_IMPORTS_START _subscribeToArray,_subscribeToPromise,_subscribeToIterable,_subscribeToObservable,_isArrayLike,_isPromise,_isObject,_symbol_iterator,_symbol_observable PURE_IMPORTS_END */
    var subscribeTo = function (result) {
        if (!!result && typeof result[observable] === 'function') {
            return subscribeToObservable(result);
        }
        else if (isArrayLike(result)) {
            return subscribeToArray(result);
        }
        else if (isPromise$1(result)) {
            return subscribeToPromise(result);
        }
        else if (!!result && typeof result[iterator] === 'function') {
            return subscribeToIterable(result);
        }
        else {
            var value = isObject$1(result) ? 'an invalid object' : "'" + result + "'";
            var msg = "You provided " + value + " where a stream was expected."
                + ' You can provide an Observable, Promise, Array, or Iterable.';
            throw new TypeError(msg);
        }
    };

    /** PURE_IMPORTS_START _InnerSubscriber,_subscribeTo,_Observable PURE_IMPORTS_END */
    function subscribeToResult(outerSubscriber, result, outerValue, outerIndex, innerSubscriber) {
        if (innerSubscriber === void 0) {
            innerSubscriber = new InnerSubscriber(outerSubscriber, outerValue, outerIndex);
        }
        if (innerSubscriber.closed) {
            return undefined;
        }
        if (result instanceof Observable) {
            return result.subscribe(innerSubscriber);
        }
        return subscribeTo(result)(innerSubscriber);
    }

    /** PURE_IMPORTS_START tslib,_util_isScheduler,_util_isArray,_OuterSubscriber,_util_subscribeToResult,_fromArray PURE_IMPORTS_END */
    var NONE = {};
    function combineLatest() {
        var observables = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            observables[_i] = arguments[_i];
        }
        var resultSelector = undefined;
        var scheduler = undefined;
        if (isScheduler(observables[observables.length - 1])) {
            scheduler = observables.pop();
        }
        if (typeof observables[observables.length - 1] === 'function') {
            resultSelector = observables.pop();
        }
        if (observables.length === 1 && isArray$1(observables[0])) {
            observables = observables[0];
        }
        return fromArray(observables, scheduler).lift(new CombineLatestOperator(resultSelector));
    }
    var CombineLatestOperator = /*@__PURE__*/ (function () {
        function CombineLatestOperator(resultSelector) {
            this.resultSelector = resultSelector;
        }
        CombineLatestOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new CombineLatestSubscriber(subscriber, this.resultSelector));
        };
        return CombineLatestOperator;
    }());
    var CombineLatestSubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(CombineLatestSubscriber, _super);
        function CombineLatestSubscriber(destination, resultSelector) {
            var _this = _super.call(this, destination) || this;
            _this.resultSelector = resultSelector;
            _this.active = 0;
            _this.values = [];
            _this.observables = [];
            return _this;
        }
        CombineLatestSubscriber.prototype._next = function (observable) {
            this.values.push(NONE);
            this.observables.push(observable);
        };
        CombineLatestSubscriber.prototype._complete = function () {
            var observables = this.observables;
            var len = observables.length;
            if (len === 0) {
                this.destination.complete();
            }
            else {
                this.active = len;
                this.toRespond = len;
                for (var i = 0; i < len; i++) {
                    var observable = observables[i];
                    this.add(subscribeToResult(this, observable, undefined, i));
                }
            }
        };
        CombineLatestSubscriber.prototype.notifyComplete = function (unused) {
            if ((this.active -= 1) === 0) {
                this.destination.complete();
            }
        };
        CombineLatestSubscriber.prototype.notifyNext = function (_outerValue, innerValue, outerIndex) {
            var values = this.values;
            var oldVal = values[outerIndex];
            var toRespond = !this.toRespond
                ? 0
                : oldVal === NONE ? --this.toRespond : this.toRespond;
            values[outerIndex] = innerValue;
            if (toRespond === 0) {
                if (this.resultSelector) {
                    this._tryResultSelector(values);
                }
                else {
                    this.destination.next(values.slice());
                }
            }
        };
        CombineLatestSubscriber.prototype._tryResultSelector = function (values) {
            var result;
            try {
                result = this.resultSelector.apply(this, values);
            }
            catch (err) {
                this.destination.error(err);
                return;
            }
            this.destination.next(result);
        };
        return CombineLatestSubscriber;
    }(OuterSubscriber));

    /** PURE_IMPORTS_START _Observable,_Subscription,_symbol_observable PURE_IMPORTS_END */
    function scheduleObservable(input, scheduler) {
        return new Observable(function (subscriber) {
            var sub = new Subscription();
            sub.add(scheduler.schedule(function () {
                var observable$1 = input[observable]();
                sub.add(observable$1.subscribe({
                    next: function (value) { sub.add(scheduler.schedule(function () { return subscriber.next(value); })); },
                    error: function (err) { sub.add(scheduler.schedule(function () { return subscriber.error(err); })); },
                    complete: function () { sub.add(scheduler.schedule(function () { return subscriber.complete(); })); },
                }));
            }));
            return sub;
        });
    }

    /** PURE_IMPORTS_START _Observable,_Subscription PURE_IMPORTS_END */
    function schedulePromise(input, scheduler) {
        return new Observable(function (subscriber) {
            var sub = new Subscription();
            sub.add(scheduler.schedule(function () {
                return input.then(function (value) {
                    sub.add(scheduler.schedule(function () {
                        subscriber.next(value);
                        sub.add(scheduler.schedule(function () { return subscriber.complete(); }));
                    }));
                }, function (err) {
                    sub.add(scheduler.schedule(function () { return subscriber.error(err); }));
                });
            }));
            return sub;
        });
    }

    /** PURE_IMPORTS_START _Observable,_Subscription,_symbol_iterator PURE_IMPORTS_END */
    function scheduleIterable(input, scheduler) {
        if (!input) {
            throw new Error('Iterable cannot be null');
        }
        return new Observable(function (subscriber) {
            var sub = new Subscription();
            var iterator$1;
            sub.add(function () {
                if (iterator$1 && typeof iterator$1.return === 'function') {
                    iterator$1.return();
                }
            });
            sub.add(scheduler.schedule(function () {
                iterator$1 = input[iterator]();
                sub.add(scheduler.schedule(function () {
                    if (subscriber.closed) {
                        return;
                    }
                    var value;
                    var done;
                    try {
                        var result = iterator$1.next();
                        value = result.value;
                        done = result.done;
                    }
                    catch (err) {
                        subscriber.error(err);
                        return;
                    }
                    if (done) {
                        subscriber.complete();
                    }
                    else {
                        subscriber.next(value);
                        this.schedule();
                    }
                }));
            }));
            return sub;
        });
    }

    /** PURE_IMPORTS_START _symbol_observable PURE_IMPORTS_END */
    function isInteropObservable(input) {
        return input && typeof input[observable] === 'function';
    }

    /** PURE_IMPORTS_START _symbol_iterator PURE_IMPORTS_END */
    function isIterable(input) {
        return input && typeof input[iterator] === 'function';
    }

    /** PURE_IMPORTS_START _scheduleObservable,_schedulePromise,_scheduleArray,_scheduleIterable,_util_isInteropObservable,_util_isPromise,_util_isArrayLike,_util_isIterable PURE_IMPORTS_END */
    function scheduled(input, scheduler) {
        if (input != null) {
            if (isInteropObservable(input)) {
                return scheduleObservable(input, scheduler);
            }
            else if (isPromise$1(input)) {
                return schedulePromise(input, scheduler);
            }
            else if (isArrayLike(input)) {
                return scheduleArray(input, scheduler);
            }
            else if (isIterable(input) || typeof input === 'string') {
                return scheduleIterable(input, scheduler);
            }
        }
        throw new TypeError((input !== null && typeof input || input) + ' is not observable');
    }

    /** PURE_IMPORTS_START _Observable,_util_subscribeTo,_scheduled_scheduled PURE_IMPORTS_END */
    function from(input, scheduler) {
        if (!scheduler) {
            if (input instanceof Observable) {
                return input;
            }
            return new Observable(subscribeTo(input));
        }
        else {
            return scheduled(input, scheduler);
        }
    }

    /** PURE_IMPORTS_START tslib,_Subscriber,_Observable,_util_subscribeTo PURE_IMPORTS_END */
    var SimpleInnerSubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(SimpleInnerSubscriber, _super);
        function SimpleInnerSubscriber(parent) {
            var _this = _super.call(this) || this;
            _this.parent = parent;
            return _this;
        }
        SimpleInnerSubscriber.prototype._next = function (value) {
            this.parent.notifyNext(value);
        };
        SimpleInnerSubscriber.prototype._error = function (error) {
            this.parent.notifyError(error);
            this.unsubscribe();
        };
        SimpleInnerSubscriber.prototype._complete = function () {
            this.parent.notifyComplete();
            this.unsubscribe();
        };
        return SimpleInnerSubscriber;
    }(Subscriber));
    var SimpleOuterSubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(SimpleOuterSubscriber, _super);
        function SimpleOuterSubscriber() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SimpleOuterSubscriber.prototype.notifyNext = function (innerValue) {
            this.destination.next(innerValue);
        };
        SimpleOuterSubscriber.prototype.notifyError = function (err) {
            this.destination.error(err);
        };
        SimpleOuterSubscriber.prototype.notifyComplete = function () {
            this.destination.complete();
        };
        return SimpleOuterSubscriber;
    }(Subscriber));
    function innerSubscribe(result, innerSubscriber) {
        if (innerSubscriber.closed) {
            return undefined;
        }
        if (result instanceof Observable) {
            return result.subscribe(innerSubscriber);
        }
        var subscription;
        try {
            subscription = subscribeTo(result)(innerSubscriber);
        }
        catch (error) {
            innerSubscriber.error(error);
        }
        return subscription;
    }

    /** PURE_IMPORTS_START tslib,_map,_observable_from,_innerSubscribe PURE_IMPORTS_END */
    function mergeMap(project, resultSelector, concurrent) {
        if (concurrent === void 0) {
            concurrent = Number.POSITIVE_INFINITY;
        }
        if (typeof resultSelector === 'function') {
            return function (source) { return source.pipe(mergeMap(function (a, i) { return from(project(a, i)).pipe(map(function (b, ii) { return resultSelector(a, b, i, ii); })); }, concurrent)); };
        }
        else if (typeof resultSelector === 'number') {
            concurrent = resultSelector;
        }
        return function (source) { return source.lift(new MergeMapOperator(project, concurrent)); };
    }
    var MergeMapOperator = /*@__PURE__*/ (function () {
        function MergeMapOperator(project, concurrent) {
            if (concurrent === void 0) {
                concurrent = Number.POSITIVE_INFINITY;
            }
            this.project = project;
            this.concurrent = concurrent;
        }
        MergeMapOperator.prototype.call = function (observer, source) {
            return source.subscribe(new MergeMapSubscriber(observer, this.project, this.concurrent));
        };
        return MergeMapOperator;
    }());
    var MergeMapSubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(MergeMapSubscriber, _super);
        function MergeMapSubscriber(destination, project, concurrent) {
            if (concurrent === void 0) {
                concurrent = Number.POSITIVE_INFINITY;
            }
            var _this = _super.call(this, destination) || this;
            _this.project = project;
            _this.concurrent = concurrent;
            _this.hasCompleted = false;
            _this.buffer = [];
            _this.active = 0;
            _this.index = 0;
            return _this;
        }
        MergeMapSubscriber.prototype._next = function (value) {
            if (this.active < this.concurrent) {
                this._tryNext(value);
            }
            else {
                this.buffer.push(value);
            }
        };
        MergeMapSubscriber.prototype._tryNext = function (value) {
            var result;
            var index = this.index++;
            try {
                result = this.project(value, index);
            }
            catch (err) {
                this.destination.error(err);
                return;
            }
            this.active++;
            this._innerSub(result);
        };
        MergeMapSubscriber.prototype._innerSub = function (ish) {
            var innerSubscriber = new SimpleInnerSubscriber(this);
            var destination = this.destination;
            destination.add(innerSubscriber);
            var innerSubscription = innerSubscribe(ish, innerSubscriber);
            if (innerSubscription !== innerSubscriber) {
                destination.add(innerSubscription);
            }
        };
        MergeMapSubscriber.prototype._complete = function () {
            this.hasCompleted = true;
            if (this.active === 0 && this.buffer.length === 0) {
                this.destination.complete();
            }
            this.unsubscribe();
        };
        MergeMapSubscriber.prototype.notifyNext = function (innerValue) {
            this.destination.next(innerValue);
        };
        MergeMapSubscriber.prototype.notifyComplete = function () {
            var buffer = this.buffer;
            this.active--;
            if (buffer.length > 0) {
                this._next(buffer.shift());
            }
            else if (this.active === 0 && this.hasCompleted) {
                this.destination.complete();
            }
        };
        return MergeMapSubscriber;
    }(SimpleOuterSubscriber));

    /** PURE_IMPORTS_START _mergeMap,_util_identity PURE_IMPORTS_END */
    function mergeAll(concurrent) {
        if (concurrent === void 0) {
            concurrent = Number.POSITIVE_INFINITY;
        }
        return mergeMap(identity, concurrent);
    }

    /** PURE_IMPORTS_START _mergeAll PURE_IMPORTS_END */
    function concatAll() {
        return mergeAll(1);
    }

    /** PURE_IMPORTS_START _of,_operators_concatAll PURE_IMPORTS_END */
    function concat() {
        var observables = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            observables[_i] = arguments[_i];
        }
        return concatAll()(of.apply(void 0, observables));
    }

    /** PURE_IMPORTS_START _isArray PURE_IMPORTS_END */
    function isNumeric(val) {
        return !isArray$1(val) && (val - parseFloat(val) + 1) >= 0;
    }

    /** PURE_IMPORTS_START _Observable,_scheduler_async,_util_isNumeric PURE_IMPORTS_END */
    function interval(period, scheduler) {
        if (period === void 0) {
            period = 0;
        }
        if (scheduler === void 0) {
            scheduler = async;
        }
        if (!isNumeric(period) || period < 0) {
            period = 0;
        }
        if (!scheduler || typeof scheduler.schedule !== 'function') {
            scheduler = async;
        }
        return new Observable(function (subscriber) {
            subscriber.add(scheduler.schedule(dispatch$1, period, { subscriber: subscriber, counter: 0, period: period }));
            return subscriber;
        });
    }
    function dispatch$1(state) {
        var subscriber = state.subscriber, counter = state.counter, period = state.period;
        subscriber.next(counter);
        this.schedule({ subscriber: subscriber, counter: counter + 1, period: period }, period);
    }

    /** PURE_IMPORTS_START _Observable,_util_isScheduler,_operators_mergeAll,_fromArray PURE_IMPORTS_END */
    function merge() {
        var observables = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            observables[_i] = arguments[_i];
        }
        var concurrent = Number.POSITIVE_INFINITY;
        var scheduler = null;
        var last = observables[observables.length - 1];
        if (isScheduler(last)) {
            scheduler = observables.pop();
            if (observables.length > 1 && typeof observables[observables.length - 1] === 'number') {
                concurrent = observables.pop();
            }
        }
        else if (typeof last === 'number') {
            concurrent = observables.pop();
        }
        if (scheduler === null && observables.length === 1 && observables[0] instanceof Observable) {
            return observables[0];
        }
        return mergeAll(concurrent)(fromArray(observables, scheduler));
    }

    /** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
    function filter(predicate, thisArg) {
        return function filterOperatorFunction(source) {
            return source.lift(new FilterOperator(predicate, thisArg));
        };
    }
    var FilterOperator = /*@__PURE__*/ (function () {
        function FilterOperator(predicate, thisArg) {
            this.predicate = predicate;
            this.thisArg = thisArg;
        }
        FilterOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new FilterSubscriber(subscriber, this.predicate, this.thisArg));
        };
        return FilterOperator;
    }());
    var FilterSubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(FilterSubscriber, _super);
        function FilterSubscriber(destination, predicate, thisArg) {
            var _this = _super.call(this, destination) || this;
            _this.predicate = predicate;
            _this.thisArg = thisArg;
            _this.count = 0;
            return _this;
        }
        FilterSubscriber.prototype._next = function (value) {
            var result;
            try {
                result = this.predicate.call(this.thisArg, value, this.count++);
            }
            catch (err) {
                this.destination.error(err);
                return;
            }
            if (result) {
                this.destination.next(value);
            }
        };
        return FilterSubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START _Observable,_scheduler_async,_util_isNumeric,_util_isScheduler PURE_IMPORTS_END */
    function timer(dueTime, periodOrScheduler, scheduler) {
        if (dueTime === void 0) {
            dueTime = 0;
        }
        var period = -1;
        if (isNumeric(periodOrScheduler)) {
            period = Number(periodOrScheduler) < 1 && 1 || Number(periodOrScheduler);
        }
        else if (isScheduler(periodOrScheduler)) {
            scheduler = periodOrScheduler;
        }
        if (!isScheduler(scheduler)) {
            scheduler = async;
        }
        return new Observable(function (subscriber) {
            var due = isNumeric(dueTime)
                ? dueTime
                : (+dueTime - scheduler.now());
            return scheduler.schedule(dispatch, due, {
                index: 0, period: period, subscriber: subscriber
            });
        });
    }
    function dispatch(state) {
        var index = state.index, period = state.period, subscriber = state.subscriber;
        subscriber.next(index);
        if (subscriber.closed) {
            return;
        }
        else if (period === -1) {
            return subscriber.complete();
        }
        state.index = index + 1;
        this.schedule(state, period);
    }

    /** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */
    function audit(durationSelector) {
        return function auditOperatorFunction(source) {
            return source.lift(new AuditOperator(durationSelector));
        };
    }
    var AuditOperator = /*@__PURE__*/ (function () {
        function AuditOperator(durationSelector) {
            this.durationSelector = durationSelector;
        }
        AuditOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new AuditSubscriber(subscriber, this.durationSelector));
        };
        return AuditOperator;
    }());
    var AuditSubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(AuditSubscriber, _super);
        function AuditSubscriber(destination, durationSelector) {
            var _this = _super.call(this, destination) || this;
            _this.durationSelector = durationSelector;
            _this.hasValue = false;
            return _this;
        }
        AuditSubscriber.prototype._next = function (value) {
            this.value = value;
            this.hasValue = true;
            if (!this.throttled) {
                var duration = void 0;
                try {
                    var durationSelector = this.durationSelector;
                    duration = durationSelector(value);
                }
                catch (err) {
                    return this.destination.error(err);
                }
                var innerSubscription = innerSubscribe(duration, new SimpleInnerSubscriber(this));
                if (!innerSubscription || innerSubscription.closed) {
                    this.clearThrottle();
                }
                else {
                    this.add(this.throttled = innerSubscription);
                }
            }
        };
        AuditSubscriber.prototype.clearThrottle = function () {
            var _a = this, value = _a.value, hasValue = _a.hasValue, throttled = _a.throttled;
            if (throttled) {
                this.remove(throttled);
                this.throttled = undefined;
                throttled.unsubscribe();
            }
            if (hasValue) {
                this.value = undefined;
                this.hasValue = false;
                this.destination.next(value);
            }
        };
        AuditSubscriber.prototype.notifyNext = function () {
            this.clearThrottle();
        };
        AuditSubscriber.prototype.notifyComplete = function () {
            this.clearThrottle();
        };
        return AuditSubscriber;
    }(SimpleOuterSubscriber));

    /** PURE_IMPORTS_START _scheduler_async,_audit,_observable_timer PURE_IMPORTS_END */
    function auditTime(duration, scheduler) {
        if (scheduler === void 0) {
            scheduler = async;
        }
        return audit(function () { return timer(duration, scheduler); });
    }

    /** PURE_IMPORTS_START tslib,_Subscriber,_scheduler_async PURE_IMPORTS_END */
    function debounceTime(dueTime, scheduler) {
        if (scheduler === void 0) {
            scheduler = async;
        }
        return function (source) { return source.lift(new DebounceTimeOperator(dueTime, scheduler)); };
    }
    var DebounceTimeOperator = /*@__PURE__*/ (function () {
        function DebounceTimeOperator(dueTime, scheduler) {
            this.dueTime = dueTime;
            this.scheduler = scheduler;
        }
        DebounceTimeOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new DebounceTimeSubscriber(subscriber, this.dueTime, this.scheduler));
        };
        return DebounceTimeOperator;
    }());
    var DebounceTimeSubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(DebounceTimeSubscriber, _super);
        function DebounceTimeSubscriber(destination, dueTime, scheduler) {
            var _this = _super.call(this, destination) || this;
            _this.dueTime = dueTime;
            _this.scheduler = scheduler;
            _this.debouncedSubscription = null;
            _this.lastValue = null;
            _this.hasValue = false;
            return _this;
        }
        DebounceTimeSubscriber.prototype._next = function (value) {
            this.clearDebounce();
            this.lastValue = value;
            this.hasValue = true;
            this.add(this.debouncedSubscription = this.scheduler.schedule(dispatchNext, this.dueTime, this));
        };
        DebounceTimeSubscriber.prototype._complete = function () {
            this.debouncedNext();
            this.destination.complete();
        };
        DebounceTimeSubscriber.prototype.debouncedNext = function () {
            this.clearDebounce();
            if (this.hasValue) {
                var lastValue = this.lastValue;
                this.lastValue = null;
                this.hasValue = false;
                this.destination.next(lastValue);
            }
        };
        DebounceTimeSubscriber.prototype.clearDebounce = function () {
            var debouncedSubscription = this.debouncedSubscription;
            if (debouncedSubscription !== null) {
                this.remove(debouncedSubscription);
                debouncedSubscription.unsubscribe();
                this.debouncedSubscription = null;
            }
        };
        return DebounceTimeSubscriber;
    }(Subscriber));
    function dispatchNext(subscriber) {
        subscriber.debouncedNext();
    }

    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function isDate(value) {
        return value instanceof Date && !isNaN(+value);
    }

    /** PURE_IMPORTS_START tslib,_scheduler_async,_util_isDate,_Subscriber,_Notification PURE_IMPORTS_END */
    function delay(delay, scheduler) {
        if (scheduler === void 0) {
            scheduler = async;
        }
        var absoluteDelay = isDate(delay);
        var delayFor = absoluteDelay ? (+delay - scheduler.now()) : Math.abs(delay);
        return function (source) { return source.lift(new DelayOperator(delayFor, scheduler)); };
    }
    var DelayOperator = /*@__PURE__*/ (function () {
        function DelayOperator(delay, scheduler) {
            this.delay = delay;
            this.scheduler = scheduler;
        }
        DelayOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new DelaySubscriber(subscriber, this.delay, this.scheduler));
        };
        return DelayOperator;
    }());
    var DelaySubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(DelaySubscriber, _super);
        function DelaySubscriber(destination, delay, scheduler) {
            var _this = _super.call(this, destination) || this;
            _this.delay = delay;
            _this.scheduler = scheduler;
            _this.queue = [];
            _this.active = false;
            _this.errored = false;
            return _this;
        }
        DelaySubscriber.dispatch = function (state) {
            var source = state.source;
            var queue = source.queue;
            var scheduler = state.scheduler;
            var destination = state.destination;
            while (queue.length > 0 && (queue[0].time - scheduler.now()) <= 0) {
                queue.shift().notification.observe(destination);
            }
            if (queue.length > 0) {
                var delay_1 = Math.max(0, queue[0].time - scheduler.now());
                this.schedule(state, delay_1);
            }
            else {
                this.unsubscribe();
                source.active = false;
            }
        };
        DelaySubscriber.prototype._schedule = function (scheduler) {
            this.active = true;
            var destination = this.destination;
            destination.add(scheduler.schedule(DelaySubscriber.dispatch, this.delay, {
                source: this, destination: this.destination, scheduler: scheduler
            }));
        };
        DelaySubscriber.prototype.scheduleNotification = function (notification) {
            if (this.errored === true) {
                return;
            }
            var scheduler = this.scheduler;
            var message = new DelayMessage(scheduler.now() + this.delay, notification);
            this.queue.push(message);
            if (this.active === false) {
                this._schedule(scheduler);
            }
        };
        DelaySubscriber.prototype._next = function (value) {
            this.scheduleNotification(Notification.createNext(value));
        };
        DelaySubscriber.prototype._error = function (err) {
            this.errored = true;
            this.queue = [];
            this.destination.error(err);
            this.unsubscribe();
        };
        DelaySubscriber.prototype._complete = function () {
            this.scheduleNotification(Notification.createComplete());
            this.unsubscribe();
        };
        return DelaySubscriber;
    }(Subscriber));
    var DelayMessage = /*@__PURE__*/ (function () {
        function DelayMessage(time, notification) {
            this.time = time;
            this.notification = notification;
        }
        return DelayMessage;
    }());

    /** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
    function distinctUntilChanged(compare, keySelector) {
        return function (source) { return source.lift(new DistinctUntilChangedOperator(compare, keySelector)); };
    }
    var DistinctUntilChangedOperator = /*@__PURE__*/ (function () {
        function DistinctUntilChangedOperator(compare, keySelector) {
            this.compare = compare;
            this.keySelector = keySelector;
        }
        DistinctUntilChangedOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new DistinctUntilChangedSubscriber(subscriber, this.compare, this.keySelector));
        };
        return DistinctUntilChangedOperator;
    }());
    var DistinctUntilChangedSubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(DistinctUntilChangedSubscriber, _super);
        function DistinctUntilChangedSubscriber(destination, compare, keySelector) {
            var _this = _super.call(this, destination) || this;
            _this.keySelector = keySelector;
            _this.hasKey = false;
            if (typeof compare === 'function') {
                _this.compare = compare;
            }
            return _this;
        }
        DistinctUntilChangedSubscriber.prototype.compare = function (x, y) {
            return x === y;
        };
        DistinctUntilChangedSubscriber.prototype._next = function (value) {
            var key;
            try {
                var keySelector = this.keySelector;
                key = keySelector ? keySelector(value) : value;
            }
            catch (err) {
                return this.destination.error(err);
            }
            var result = false;
            if (this.hasKey) {
                try {
                    var compare = this.compare;
                    result = compare(this.key, key);
                }
                catch (err) {
                    return this.destination.error(err);
                }
            }
            else {
                this.hasKey = true;
            }
            if (!result) {
                this.key = key;
                this.destination.next(value);
            }
        };
        return DistinctUntilChangedSubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START tslib,_Subscriber,_util_ArgumentOutOfRangeError,_observable_empty PURE_IMPORTS_END */
    function take(count) {
        return function (source) {
            if (count === 0) {
                return empty();
            }
            else {
                return source.lift(new TakeOperator(count));
            }
        };
    }
    var TakeOperator = /*@__PURE__*/ (function () {
        function TakeOperator(total) {
            this.total = total;
            if (this.total < 0) {
                throw new ArgumentOutOfRangeError;
            }
        }
        TakeOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new TakeSubscriber(subscriber, this.total));
        };
        return TakeOperator;
    }());
    var TakeSubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(TakeSubscriber, _super);
        function TakeSubscriber(destination, total) {
            var _this = _super.call(this, destination) || this;
            _this.total = total;
            _this.count = 0;
            return _this;
        }
        TakeSubscriber.prototype._next = function (value) {
            var total = this.total;
            var count = ++this.count;
            if (count <= total) {
                this.destination.next(value);
                if (count === total) {
                    this.destination.complete();
                    this.unsubscribe();
                }
            }
        };
        return TakeSubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START tslib,_Subscriber,_Subscription PURE_IMPORTS_END */
    function finalize(callback) {
        return function (source) { return source.lift(new FinallyOperator(callback)); };
    }
    var FinallyOperator = /*@__PURE__*/ (function () {
        function FinallyOperator(callback) {
            this.callback = callback;
        }
        FinallyOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new FinallySubscriber(subscriber, this.callback));
        };
        return FinallyOperator;
    }());
    var FinallySubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(FinallySubscriber, _super);
        function FinallySubscriber(destination, callback) {
            var _this = _super.call(this, destination) || this;
            _this.add(new Subscription(callback));
            return _this;
        }
        return FinallySubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
    function pairwise() {
        return function (source) { return source.lift(new PairwiseOperator()); };
    }
    var PairwiseOperator = /*@__PURE__*/ (function () {
        function PairwiseOperator() {
        }
        PairwiseOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new PairwiseSubscriber(subscriber));
        };
        return PairwiseOperator;
    }());
    var PairwiseSubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(PairwiseSubscriber, _super);
        function PairwiseSubscriber(destination) {
            var _this = _super.call(this, destination) || this;
            _this.hasPrev = false;
            return _this;
        }
        PairwiseSubscriber.prototype._next = function (value) {
            var pair;
            if (this.hasPrev) {
                pair = [this.prev, value];
            }
            else {
                this.hasPrev = true;
            }
            this.prev = value;
            if (pair) {
                this.destination.next(pair);
            }
        };
        return PairwiseSubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START tslib,_Subscriber,_observable_empty PURE_IMPORTS_END */
    function repeat(count) {
        if (count === void 0) {
            count = -1;
        }
        return function (source) {
            if (count === 0) {
                return empty();
            }
            else if (count < 0) {
                return source.lift(new RepeatOperator(-1, source));
            }
            else {
                return source.lift(new RepeatOperator(count - 1, source));
            }
        };
    }
    var RepeatOperator = /*@__PURE__*/ (function () {
        function RepeatOperator(count, source) {
            this.count = count;
            this.source = source;
        }
        RepeatOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new RepeatSubscriber(subscriber, this.count, this.source));
        };
        return RepeatOperator;
    }());
    var RepeatSubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(RepeatSubscriber, _super);
        function RepeatSubscriber(destination, count, source) {
            var _this = _super.call(this, destination) || this;
            _this.count = count;
            _this.source = source;
            return _this;
        }
        RepeatSubscriber.prototype.complete = function () {
            if (!this.isStopped) {
                var _a = this, source = _a.source, count = _a.count;
                if (count === 0) {
                    return _super.prototype.complete.call(this);
                }
                else if (count > -1) {
                    this.count = count - 1;
                }
                source.subscribe(this._unsubscribeAndRecycle());
            }
        };
        return RepeatSubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
    function skip(count) {
        return function (source) { return source.lift(new SkipOperator(count)); };
    }
    var SkipOperator = /*@__PURE__*/ (function () {
        function SkipOperator(total) {
            this.total = total;
        }
        SkipOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new SkipSubscriber(subscriber, this.total));
        };
        return SkipOperator;
    }());
    var SkipSubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(SkipSubscriber, _super);
        function SkipSubscriber(destination, total) {
            var _this = _super.call(this, destination) || this;
            _this.total = total;
            _this.count = 0;
            return _this;
        }
        SkipSubscriber.prototype._next = function (x) {
            if (++this.count > this.total) {
                this.destination.next(x);
            }
        };
        return SkipSubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START _observable_concat,_util_isScheduler PURE_IMPORTS_END */
    function startWith() {
        var array = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            array[_i] = arguments[_i];
        }
        var scheduler = array[array.length - 1];
        if (isScheduler(scheduler)) {
            array.pop();
            return function (source) { return concat(array, source, scheduler); };
        }
        else {
            return function (source) { return concat(array, source); };
        }
    }

    /** PURE_IMPORTS_START tslib,_map,_observable_from,_innerSubscribe PURE_IMPORTS_END */
    function switchMap(project, resultSelector) {
        if (typeof resultSelector === 'function') {
            return function (source) { return source.pipe(switchMap(function (a, i) { return from(project(a, i)).pipe(map(function (b, ii) { return resultSelector(a, b, i, ii); })); })); };
        }
        return function (source) { return source.lift(new SwitchMapOperator(project)); };
    }
    var SwitchMapOperator = /*@__PURE__*/ (function () {
        function SwitchMapOperator(project) {
            this.project = project;
        }
        SwitchMapOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new SwitchMapSubscriber(subscriber, this.project));
        };
        return SwitchMapOperator;
    }());
    var SwitchMapSubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(SwitchMapSubscriber, _super);
        function SwitchMapSubscriber(destination, project) {
            var _this = _super.call(this, destination) || this;
            _this.project = project;
            _this.index = 0;
            return _this;
        }
        SwitchMapSubscriber.prototype._next = function (value) {
            var result;
            var index = this.index++;
            try {
                result = this.project(value, index);
            }
            catch (error) {
                this.destination.error(error);
                return;
            }
            this._innerSub(result);
        };
        SwitchMapSubscriber.prototype._innerSub = function (result) {
            var innerSubscription = this.innerSubscription;
            if (innerSubscription) {
                innerSubscription.unsubscribe();
            }
            var innerSubscriber = new SimpleInnerSubscriber(this);
            var destination = this.destination;
            destination.add(innerSubscriber);
            this.innerSubscription = innerSubscribe(result, innerSubscriber);
            if (this.innerSubscription !== innerSubscriber) {
                destination.add(this.innerSubscription);
            }
        };
        SwitchMapSubscriber.prototype._complete = function () {
            var innerSubscription = this.innerSubscription;
            if (!innerSubscription || innerSubscription.closed) {
                _super.prototype._complete.call(this);
            }
            this.unsubscribe();
        };
        SwitchMapSubscriber.prototype._unsubscribe = function () {
            this.innerSubscription = undefined;
        };
        SwitchMapSubscriber.prototype.notifyComplete = function () {
            this.innerSubscription = undefined;
            if (this.isStopped) {
                _super.prototype._complete.call(this);
            }
        };
        SwitchMapSubscriber.prototype.notifyNext = function (innerValue) {
            this.destination.next(innerValue);
        };
        return SwitchMapSubscriber;
    }(SimpleOuterSubscriber));

    /** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
    function takeWhile(predicate, inclusive) {
        if (inclusive === void 0) {
            inclusive = false;
        }
        return function (source) {
            return source.lift(new TakeWhileOperator(predicate, inclusive));
        };
    }
    var TakeWhileOperator = /*@__PURE__*/ (function () {
        function TakeWhileOperator(predicate, inclusive) {
            this.predicate = predicate;
            this.inclusive = inclusive;
        }
        TakeWhileOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new TakeWhileSubscriber(subscriber, this.predicate, this.inclusive));
        };
        return TakeWhileOperator;
    }());
    var TakeWhileSubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(TakeWhileSubscriber, _super);
        function TakeWhileSubscriber(destination, predicate, inclusive) {
            var _this = _super.call(this, destination) || this;
            _this.predicate = predicate;
            _this.inclusive = inclusive;
            _this.index = 0;
            return _this;
        }
        TakeWhileSubscriber.prototype._next = function (value) {
            var destination = this.destination;
            var result;
            try {
                result = this.predicate(value, this.index++);
            }
            catch (err) {
                destination.error(err);
                return;
            }
            this.nextOrComplete(value, result);
        };
        TakeWhileSubscriber.prototype.nextOrComplete = function (value, predicateResult) {
            var destination = this.destination;
            if (Boolean(predicateResult)) {
                destination.next(value);
            }
            else {
                if (this.inclusive) {
                    destination.next(value);
                }
                destination.complete();
            }
        };
        return TakeWhileSubscriber;
    }(Subscriber));

    /** PURE_IMPORTS_START tslib,_Subscriber,_util_noop,_util_isFunction PURE_IMPORTS_END */
    function tap(nextOrObserver, error, complete) {
        return function tapOperatorFunction(source) {
            return source.lift(new DoOperator(nextOrObserver, error, complete));
        };
    }
    var DoOperator = /*@__PURE__*/ (function () {
        function DoOperator(nextOrObserver, error, complete) {
            this.nextOrObserver = nextOrObserver;
            this.error = error;
            this.complete = complete;
        }
        DoOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new TapSubscriber(subscriber, this.nextOrObserver, this.error, this.complete));
        };
        return DoOperator;
    }());
    var TapSubscriber = /*@__PURE__*/ (function (_super) {
        __extends$1(TapSubscriber, _super);
        function TapSubscriber(destination, observerOrNext, error, complete) {
            var _this = _super.call(this, destination) || this;
            _this._tapNext = noop;
            _this._tapError = noop;
            _this._tapComplete = noop;
            _this._tapError = error || noop;
            _this._tapComplete = complete || noop;
            if (isFunction$1(observerOrNext)) {
                _this._context = _this;
                _this._tapNext = observerOrNext;
            }
            else if (observerOrNext) {
                _this._context = observerOrNext;
                _this._tapNext = observerOrNext.next || noop;
                _this._tapError = observerOrNext.error || noop;
                _this._tapComplete = observerOrNext.complete || noop;
            }
            return _this;
        }
        TapSubscriber.prototype._next = function (value) {
            try {
                this._tapNext.call(this._context, value);
            }
            catch (err) {
                this.destination.error(err);
                return;
            }
            this.destination.next(value);
        };
        TapSubscriber.prototype._error = function (err) {
            try {
                this._tapError.call(this._context, err);
            }
            catch (err) {
                this.destination.error(err);
                return;
            }
            this.destination.error(err);
        };
        TapSubscriber.prototype._complete = function () {
            try {
                this._tapComplete.call(this._context);
            }
            catch (err) {
                this.destination.error(err);
                return;
            }
            return this.destination.complete();
        };
        return TapSubscriber;
    }(Subscriber));

    /* src\interfaces\game-state.svelte generated by Svelte v3.42.2 */

    var GameState;

    (function (GameState) {
    	GameState[GameState["Loading"] = 0] = "Loading";
    	GameState[GameState["Paused"] = 1] = "Paused";
    	GameState[GameState["Started"] = 2] = "Started";
    	GameState[GameState["Over"] = 3] = "Over";
    })(GameState || (GameState = {}));

    /* src\services\local-storage.service.svelte generated by Svelte v3.42.2 */

    function create_fragment$k(ctx) {
    	const block = {
    		c: noop$1,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop$1,
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: noop$1
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const SVELTE_TETRIS_STORAGE_KEY = "SVELTE_TETRIS";

    function setMaxPoint(max) {
    	localStorage.setItem(SVELTE_TETRIS_STORAGE_KEY, `${max}`);
    }

    function maxPoint() {
    	const max = parseInt(localStorage.getItem(SVELTE_TETRIS_STORAGE_KEY));
    	return Number.isInteger(max) ? max : 0;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Local_storage_service', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Local_storage_service> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		SVELTE_TETRIS_STORAGE_KEY,
    		setMaxPoint,
    		maxPoint
    	});

    	return [];
    }

    class Local_storage_service extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Local_storage_service",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    var LocalStorageService = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Local_storage_service,
        setMaxPoint: setMaxPoint,
        maxPoint: maxPoint
    });

    /* src\interfaces\tile\empty-tile.svelte generated by Svelte v3.42.2 */

    class EmptyTile extends Tile$1 {
    	constructor() {
    		super(0);
    		this.isSolid = false;
    	}
    }

    /* src\interfaces\matrix.svelte generated by Svelte v3.42.2 */



    class MatrixUtil {
    	static getStartBoard(startLines = 0) {
    		if (startLines === 0) {
    			return new Array(this.Width * this.Height).fill(new EmptyTile());
    		}

    		const startMatrix = [];

    		for (let i = 0; i < startLines; i++) {
    			if (i <= 2) {
    				// 0-3
    				startMatrix.push(...this.getRandomFilledRow(5, 8));
    			} else if (i <= 6) {
    				// 4-6
    				startMatrix.push(...this.getRandomFilledRow(4, 9));
    			} else {
    				// 7-9
    				startMatrix.push(...this.getRandomFilledRow(3, 9));
    			}
    		}

    		for (let i = 0, len = 20 - startLines; i < len; i++) {
    			startMatrix.unshift(...this.EmptyRow);
    		}

    		return startMatrix;
    	}

    	static getRandomFilledRow(min, max) {
    		const count = parseInt(`${(max - min + 1) * Math.random() + min}`, 10);
    		const line = new Array(count).fill(new FilledTile(true));

    		for (let i = 0, len = 10 - count; i < len; i++) {
    			const index = parseInt(`${(line.length + 1) * Math.random()}`, 10);
    			line.splice(index, 0, new EmptyTile());
    		}

    		return line;
    	}

    	static get EmptyRow() {
    		return new Array(this.Width).fill(new EmptyTile());
    	}

    	static get FullRow() {
    		return new Array(this.Width).fill(new FilledTile());
    	}

    	static getSpeedDelay(speed) {
    		var _a;

    		return (_a = this.SpeedDelay[speed - 1]) !== null && _a !== void 0
    		? _a
    		: this.SpeedDelay[0];
    	}
    }

    MatrixUtil.Width = 10;
    MatrixUtil.Height = 20;
    MatrixUtil.Points = [100, 300, 700, 1500];
    MatrixUtil.MaxPoint = 999999;
    MatrixUtil.SpeedDelay = [700, 600, 450, 320, 240, 160];

    /* src\interfaces\piece\piece-enum.svelte generated by Svelte v3.42.2 */

    var PieceRotation;

    (function (PieceRotation) {
    	PieceRotation[PieceRotation["Deg0"] = 0] = "Deg0";
    	PieceRotation[PieceRotation["Deg90"] = 1] = "Deg90";
    	PieceRotation[PieceRotation["Deg180"] = 2] = "Deg180";
    	PieceRotation[PieceRotation["Deg270"] = 3] = "Deg270";
    })(PieceRotation || (PieceRotation = {}));

    var PieceTypes;

    (function (PieceTypes) {
    	PieceTypes["Dot"] = "Dot";
    	PieceTypes["O"] = "O";
    	PieceTypes["I"] = "I";
    	PieceTypes["T"] = "T";
    	PieceTypes["L"] = "L";
    	PieceTypes["J"] = "J";
    	PieceTypes["Z"] = "Z";
    	PieceTypes["S"] = "S";
    })(PieceTypes || (PieceTypes = {}));

    /* src\interfaces\piece\piece.svelte generated by Svelte v3.42.2 */



    class Piece {
    	constructor(x, y) {
    		this.rotation = PieceRotation.Deg0;
    		this.x = x;
    		this.y = y;
    	}

    	store() {
    		this._lastConfig = {
    			x: this.x,
    			y: this.y,
    			rotation: this.rotation,
    			shape: this.shape
    		};

    		return this._newPiece();
    	}

    	clearStore() {
    		this._lastConfig = null;
    		return this._newPiece();
    	}

    	revert() {
    		if (this._lastConfig) {
    			for (const key in this._lastConfig) {
    				if (this._lastConfig.hasOwnProperty(key)) {
    					this[key] = this._lastConfig[key];
    				}
    			}

    			this._lastConfig = null;
    		}

    		return this._newPiece();
    	}

    	rotate() {
    		const keys = Object.keys(this._shapes);
    		const idx = keys.indexOf(this.rotation.toString());
    		const isTurnOver = idx >= keys.length - 1;
    		this.rotation = Number(isTurnOver ? keys[0] : keys[idx + 1]);
    		this.shape = this._shapes[this.rotation];
    		return this._newPiece();
    	}

    	moveDown(step = 1) {
    		this.y = this.y + step;
    		return this._newPiece();
    	}

    	moveRight() {
    		this.x++;
    		return this._newPiece();
    	}

    	moveLeft() {
    		this.x--;
    		return this._newPiece();
    	}

    	get positionOnGrid() {
    		const positions = [];

    		for (let row = 0; row < 4; row++) {
    			for (let col = 0; col < 4; col++) {
    				if (this.shape[row][col]) {
    					const position = (this.y + row) * MatrixUtil.Width + this.x + col;

    					if (position >= 0) {
    						positions.push(position);
    					}
    				}
    			}
    		}

    		return positions;
    	}

    	get bottomRow() {
    		return this.y + 3;
    	}

    	get rightCol() {
    		let col = 3;

    		while (col >= 0) {
    			for (let row = 0; row <= 3; row++) {
    				if (this.shape[row][col]) {
    					return this.x + col;
    				}
    			}

    			col--;
    		}
    	}

    	get leftCol() {
    		return this.x;
    	}

    	setShapes(shapes) {
    		this._shapes = shapes;
    		this.shape = shapes[this.rotation];
    	}

    	_newPiece() {
    		const piece = new Piece(this.x, this.y);
    		piece.rotation = this.rotation;
    		piece.type = this.type;
    		piece.next = this.next;
    		piece.setShapes(this._shapes);
    		piece._lastConfig = this._lastConfig;
    		return piece;
    	}
    }

    /* src\interfaces\piece\Z.svelte generated by Svelte v3.42.2 */


    const SHAPES_Z = [];
    SHAPES_Z[PieceRotation.Deg0] = [[0, 0, 0, 0], [0, 1, 0, 0], [1, 1, 0, 0], [1, 0, 0, 0]];
    SHAPES_Z[PieceRotation.Deg90] = [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 0, 0], [0, 1, 1, 0]];

    class PieceZ extends Piece {
    	constructor(x, y) {
    		super(x, y);
    		this.type = PieceTypes.Z;
    		this.next = [[1, 1, 0, 0], [0, 1, 1, 0]];
    		this.setShapes(SHAPES_Z);
    	}
    }

    /* src\interfaces\piece\T.svelte generated by Svelte v3.42.2 */


    const SHAPES_T = [];
    SHAPES_T[PieceRotation.Deg0] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 1, 0, 0], [1, 1, 1, 0]];
    SHAPES_T[PieceRotation.Deg90] = [[0, 0, 0, 0], [1, 0, 0, 0], [1, 1, 0, 0], [1, 0, 0, 0]];
    SHAPES_T[PieceRotation.Deg180] = [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0]];
    SHAPES_T[PieceRotation.Deg270] = [[0, 0, 0, 0], [0, 1, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0]];

    class PieceT extends Piece {
    	constructor(x, y) {
    		super(x, y);
    		this.type = PieceTypes.T;
    		this.next = [[0, 1, 0, 0], [1, 1, 1, 0]];
    		this.setShapes(SHAPES_T);
    	}
    }

    /* src\interfaces\piece\S.svelte generated by Svelte v3.42.2 */


    const SHAPES_S = [];
    SHAPES_S[PieceRotation.Deg0] = [[0, 0, 0, 0], [1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0]];
    SHAPES_S[PieceRotation.Deg90] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 1, 1, 0], [1, 1, 0, 0]];

    class PieceS extends Piece {
    	constructor(x, y) {
    		super(x, y);
    		this.type = PieceTypes.S;
    		this.next = [[0, 1, 1, 0], [1, 1, 0, 0]];
    		this.setShapes(SHAPES_S);
    	}
    }

    /* src\interfaces\piece\O.svelte generated by Svelte v3.42.2 */


    const SHAPES_O = [];
    SHAPES_O[PieceRotation.Deg0] = [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 0, 0], [1, 1, 0, 0]];

    class PieceO extends Piece {
    	constructor(x, y) {
    		super(x, y);
    		this.type = PieceTypes.O;
    		this.next = [[0, 1, 1, 0], [0, 1, 1, 0]];
    		this.setShapes(SHAPES_O);
    	}
    }

    /* src\interfaces\piece\L.svelte generated by Svelte v3.42.2 */


    const SHAPES_L = [];
    SHAPES_L[PieceRotation.Deg0] = [[0, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0], [1, 1, 0, 0]];
    SHAPES_L[PieceRotation.Deg90] = [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 0], [1, 0, 0, 0]];
    SHAPES_L[PieceRotation.Deg180] = [[0, 0, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]];
    SHAPES_L[PieceRotation.Deg270] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 1, 0], [1, 1, 1, 0]];

    class PieceL extends Piece {
    	constructor(x, y) {
    		super(x, y);
    		this.type = PieceTypes.L;
    		this.next = [[0, 0, 1, 0], [1, 1, 1, 0]];
    		this.setShapes(SHAPES_L);
    	}
    }

    /* src\interfaces\piece\J.svelte generated by Svelte v3.42.2 */


    const SHAPES_J = [];
    SHAPES_J[PieceRotation.Deg0] = [[0, 0, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [1, 1, 0, 0]];
    SHAPES_J[PieceRotation.Deg90] = [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 0], [0, 0, 1, 0]];
    SHAPES_J[PieceRotation.Deg180] = [[0, 0, 0, 0], [1, 1, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0]];
    SHAPES_J[PieceRotation.Deg270] = [[0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0], [1, 1, 1, 0]];

    class PieceJ extends Piece {
    	constructor(x, y) {
    		super(x, y);
    		this.type = PieceTypes.J;
    		this.next = [[1, 0, 0, 0], [1, 1, 1, 0]];
    		this.setShapes(SHAPES_J);
    	}
    }

    /* src\interfaces\piece\I.svelte generated by Svelte v3.42.2 */


    const SHAPES_I = [];
    SHAPES_I[PieceRotation.Deg0] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1]];
    SHAPES_I[PieceRotation.Deg90] = [[1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0]];

    class PieceI extends Piece {
    	constructor(x, y) {
    		super(x, y);
    		this.type = PieceTypes.I;
    		this.next = [[0, 0, 0, 0], [1, 1, 1, 1]];
    		this.setShapes(SHAPES_I);
    	}
    }

    /* src\factory\piece-factory.svelte generated by Svelte v3.42.2 */


    const SPAWN_POSITION_X = 4;
    const SPAWN_POSITION_Y = -4;

    class PieceFactory {
    	constructor() {
    		this._available = [];
    		this._currentBag = [];
    		this._available.push(PieceI);
    		this._available.push(PieceJ);
    		this._available.push(PieceL);
    		this._available.push(PieceO);
    		this._available.push(PieceS);
    		this._available.push(PieceT);
    		this._available.push(PieceZ);
    	}

    	getRandomPiece(x = SPAWN_POSITION_X, y = SPAWN_POSITION_Y) {
    		if (this._currentBag.length === 0) {
    			this.generateNewBag();
    		}

    		const nextPiece = this._currentBag.pop();
    		return new nextPiece(x, y);
    	}

    	generateNewBag() {
    		this._currentBag = this._available.slice();
    		this.shuffleArray(this._currentBag);
    	}

    	shuffleArray(array) {
    		for (let i = array.length - 1; i > 0; i--) {
    			const j = Math.floor(Math.random() * (i + 1));
    			[array[i], array[j]] = [array[j], array[i]];
    		}
    	}
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    /** @deprecated */
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    var currentAction = {
        type: null,
        entityIds: null,
        skip: false,
        payload: null
    };
    var customActionActive = false;
    function resetCustomAction() {
        customActionActive = false;
    }
    // public API for custom actions. Custom action always wins
    function logAction(type, entityIds, payload) {
        setAction(type, entityIds, payload);
        customActionActive = true;
    }
    function setAction(type, entityIds, payload) {
        if (customActionActive === false) {
            currentAction.type = type;
            currentAction.entityIds = entityIds;
            currentAction.payload = payload;
        }
    }
    function setSkipAction(skip) {
        if (skip === void 0) { skip = true; }
        currentAction.skip = skip;
    }
    function action(action, entityIds) {
        return function (target, propertyKey, descriptor) {
            var originalMethod = descriptor.value;
            descriptor.value = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                logAction(action, entityIds);
                return originalMethod.apply(this, args);
            };
            return descriptor;
        };
    }

    // @internal
    function hasEntity(entities, id) {
        return entities.hasOwnProperty(id);
    }

    // @internal
    function isArray(value) {
        return Array.isArray(value);
    }

    // @internal
    function hasActiveState(state) {
        return state.hasOwnProperty('active');
    }
    // @internal
    function isMultiActiveState(active) {
        return isArray(active);
    }
    // @internal
    function resolveActiveEntity(_a) {
        var active = _a.active, ids = _a.ids, entities = _a.entities;
        if (isMultiActiveState(active)) {
            return getExitingActives(active, ids);
        }
        if (hasEntity(entities, active) === false) {
            return null;
        }
        return active;
    }
    // @internal
    function getExitingActives(currentActivesIds, newIds) {
        var filtered = currentActivesIds.filter(function (id) { return newIds.indexOf(id) > -1; });
        /** Return the same reference if nothing has changed */
        if (filtered.length === currentActivesIds.length) {
            return currentActivesIds;
        }
        return filtered;
    }

    // @internal
    function addEntities(_a) {
        var e_1, _b;
        var state = _a.state, entities = _a.entities, idKey = _a.idKey, _c = _a.options, options = _c === void 0 ? {} : _c, preAddEntity = _a.preAddEntity;
        var newEntities = {};
        var newIds = [];
        var hasNewEntities = false;
        try {
            for (var entities_1 = __values(entities), entities_1_1 = entities_1.next(); !entities_1_1.done; entities_1_1 = entities_1.next()) {
                var entity = entities_1_1.value;
                if (hasEntity(state.entities, entity[idKey]) === false) {
                    // evaluate the middleware first to support dynamic ids
                    var current = preAddEntity(entity);
                    var entityId = current[idKey];
                    newEntities[entityId] = current;
                    if (options.prepend)
                        newIds.unshift(entityId);
                    else
                        newIds.push(entityId);
                    hasNewEntities = true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (entities_1_1 && !entities_1_1.done && (_b = entities_1.return)) _b.call(entities_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return hasNewEntities
            ? {
                newState: __assign(__assign({}, state), { entities: __assign(__assign({}, state.entities), newEntities), ids: options.prepend ? __spread(newIds, state.ids) : __spread(state.ids, newIds) }),
                newIds: newIds
            }
            : null;
    }

    // @internal
    function isNil(v) {
        return v === null || v === undefined;
    }

    // @internal
    function coerceArray(value) {
        if (isNil(value)) {
            return [];
        }
        return Array.isArray(value) ? value : [value];
    }

    var DEFAULT_ID_KEY = 'id';

    // @internal
    function isEmpty(arr) {
        if (isArray(arr)) {
            return arr.length === 0;
        }
        return false;
    }

    // @internal
    function isFunction(value) {
        return typeof value === 'function';
    }
    // @internal
    function distinctUntilArrayItemChanged() {
        return distinctUntilChanged(function (prevCollection, currentCollection) {
            if (prevCollection === currentCollection) {
                return true;
            }
            if (!isArray(prevCollection) || !isArray(currentCollection)) {
                return false;
            }
            if (isEmpty(prevCollection) && isEmpty(currentCollection)) {
                return true;
            }
            if (prevCollection.length !== currentCollection.length) {
                return false;
            }
            var isOneOfItemReferenceChanged = currentCollection.some(function (item, i) {
                return prevCollection[i] !== item;
            });
            // return false means there is a change and we want to call next()
            return isOneOfItemReferenceChanged === false;
        });
    }

    // @internal
    function isObject(value) {
        var type = typeof value;
        return value != null && (type == 'object' || type == 'function');
    }

    var CONFIG = {
        resettable: false,
        ttl: null,
        producerFn: undefined
    };
    // @internal
    function getAkitaConfig() {
        return CONFIG;
    }
    function getGlobalProducerFn() {
        return CONFIG.producerFn;
    }

    // @internal
    function isDefined(val) {
        return isNil(val) === false;
    }

    // @internal
    var $$deleteStore = new Subject();
    // @internal
    var $$addStore = new ReplaySubject(50, 5000);
    // @internal
    var $$updateStore = new Subject();
    // @internal
    function dispatchDeleted(storeName) {
        $$deleteStore.next(storeName);
    }
    // @internal
    function dispatchAdded(storeName) {
        $$addStore.next(storeName);
    }
    // @internal
    function dispatchUpdate(storeName, action) {
        $$updateStore.next({ storeName: storeName, action: action });
    }

    var isBrowser = typeof window !== 'undefined';
    var isNotBrowser = !isBrowser;
    // export const isNativeScript = typeof global !== 'undefined' && (<any>global).__runtimeVersion !== 'undefined'; TODO is this used?
    var hasLocalStorage = function () {
        try {
            return typeof localStorage !== 'undefined';
        }
        catch (_a) {
            return false;
        }
    };
    var hasSessionStorage = function () {
        try {
            return typeof sessionStorage !== 'undefined';
        }
        catch (_a) {
            return false;
        }
    };

    // @internal
    var __stores__ = {};
    // @internal
    var __queries__ = {};
    if (isBrowser) {
        window.$$stores = __stores__;
        window.$$queries = __queries__;
    }

    // @internal
    function capitalize(value) {
        return value && value.charAt(0).toUpperCase() + value.slice(1);
    }

    var subs = [];
    function akitaDevtools(ngZoneOrOptions, options) {
        if (options === void 0) { options = {}; }
        if (isNotBrowser)
            return;
        if (!window.__REDUX_DEVTOOLS_EXTENSION__) {
            return;
        }
        subs.length &&
            subs.forEach(function (s) {
                if (s.unsubscribe) {
                    s.unsubscribe();
                }
                else {
                    s && s();
                }
            });
        var isAngular = ngZoneOrOptions && ngZoneOrOptions['run'];
        if (!isAngular) {
            ngZoneOrOptions = ngZoneOrOptions || {};
            ngZoneOrOptions.run = function (cb) { return cb(); };
            options = ngZoneOrOptions;
        }
        var defaultOptions = { name: 'Akita', shallow: true, storesWhitelist: [] };
        var merged = Object.assign({}, defaultOptions, options);
        var storesWhitelist = merged.storesWhitelist;
        var devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect(merged);
        var appState = {};
        var isAllowed = function (storeName) {
            if (!storesWhitelist.length) {
                return true;
            }
            return storesWhitelist.indexOf(storeName) > -1;
        };
        subs.push($$addStore.subscribe(function (storeName) {
            var _a;
            if (isAllowed(storeName) === false)
                return;
            appState = __assign(__assign({}, appState), (_a = {}, _a[storeName] = __stores__[storeName]._value(), _a));
            devTools.send({ type: "[" + capitalize(storeName) + "] - @@INIT" }, appState);
        }));
        subs.push($$deleteStore.subscribe(function (storeName) {
            if (isAllowed(storeName) === false)
                return;
            delete appState[storeName];
            devTools.send({ type: "[" + storeName + "] - Delete Store" }, appState);
        }));
        subs.push($$updateStore.subscribe(function (_a) {
            var _b;
            var storeName = _a.storeName, action = _a.action;
            if (isAllowed(storeName) === false)
                return;
            var type = action.type, entityIds = action.entityIds, skip = action.skip, rest = __rest(action, ["type", "entityIds", "skip"]);
            var payload = rest.payload;
            if (skip) {
                setSkipAction(false);
                return;
            }
            var store = __stores__[storeName];
            if (!store) {
                return;
            }
            if (options.shallow === false && appState[storeName]) {
                var isEqual = JSON.stringify(store._value()) === JSON.stringify(appState[storeName]);
                if (isEqual)
                    return;
            }
            appState = __assign(__assign({}, appState), (_b = {}, _b[storeName] = store._value(), _b));
            var normalize = capitalize(storeName);
            var msg = isDefined(entityIds) ? "[" + normalize + "] - " + type + " (ids: " + entityIds + ")" : "[" + normalize + "] - " + type;
            if (options.logTrace) {
                console.group(msg);
                console.trace();
                console.groupEnd();
            }
            if (options.sortAlphabetically) {
                var sortedAppState = Object.keys(appState)
                    .sort()
                    .reduce(function (acc, storeName) {
                    acc[storeName] = appState[storeName];
                    return acc;
                }, {});
                devTools.send(__assign({ type: msg }, payload), sortedAppState);
                return;
            }
            devTools.send(__assign({ type: msg }, payload), appState);
        }));
        subs.push(devTools.subscribe(function (message) {
            if (message.type === 'DISPATCH') {
                var payloadType = message.payload.type;
                if (payloadType === 'COMMIT') {
                    devTools.init(appState);
                    return;
                }
                if (message.state) {
                    var rootState_1 = JSON.parse(message.state);
                    var _loop_1 = function (i, keys) {
                        var storeName = keys[i];
                        if (__stores__[storeName]) {
                            ngZoneOrOptions.run(function () {
                                __stores__[storeName]._setState(function () { return rootState_1[storeName]; }, false);
                            });
                        }
                    };
                    for (var i = 0, keys = Object.keys(rootState_1); i < keys.length; i++) {
                        _loop_1(i, keys);
                    }
                }
            }
        }));
    }

    var Order;
    (function (Order) {
        Order["ASC"] = "asc";
        Order["DESC"] = "desc";
    })(Order || (Order = {}));
    // @internal
    function compareValues(key, order) {
        if (order === void 0) { order = Order.ASC; }
        return function (a, b) {
            if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
                return 0;
            }
            var varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
            var varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];
            var comparison = 0;
            if (varA > varB) {
                comparison = 1;
            }
            else if (varA < varB) {
                comparison = -1;
            }
            return order == Order.DESC ? comparison * -1 : comparison;
        };
    }

    // @internal
    function entitiesToArray(state, options) {
        var arr = [];
        var ids = state.ids, entities = state.entities;
        var filterBy = options.filterBy, limitTo = options.limitTo, sortBy = options.sortBy, sortByOrder = options.sortByOrder;
        var _loop_1 = function (i) {
            var entity = entities[ids[i]];
            if (!filterBy) {
                arr.push(entity);
                return "continue";
            }
            var toArray = coerceArray(filterBy);
            var allPass = toArray.every(function (fn) { return fn(entity, i); });
            if (allPass) {
                arr.push(entity);
            }
        };
        for (var i = 0; i < ids.length; i++) {
            _loop_1(i);
        }
        if (sortBy) {
            var _sortBy_1 = isFunction(sortBy) ? sortBy : compareValues(sortBy, sortByOrder);
            arr = arr.sort(function (a, b) { return _sortBy_1(a, b, state); });
        }
        var length = Math.min(limitTo || arr.length, arr.length);
        return length === arr.length ? arr : arr.slice(0, length);
    }

    // @internal
    function entitiesToMap(state, options) {
        var map = {};
        var filterBy = options.filterBy, limitTo = options.limitTo;
        var ids = state.ids, entities = state.entities;
        if (!filterBy && !limitTo) {
            return entities;
        }
        var hasLimit = isNil(limitTo) === false;
        if (filterBy && hasLimit) {
            var count = 0;
            var _loop_1 = function (i, length_1) {
                if (count === limitTo)
                    return "break";
                var id = ids[i];
                var entity = entities[id];
                var allPass = coerceArray(filterBy).every(function (fn) { return fn(entity, i); });
                if (allPass) {
                    map[id] = entity;
                    count++;
                }
            };
            for (var i = 0, length_1 = ids.length; i < length_1; i++) {
                var state_1 = _loop_1(i, length_1);
                if (state_1 === "break")
                    break;
            }
        }
        else {
            var finalLength = Math.min(limitTo || ids.length, ids.length);
            var _loop_2 = function (i) {
                var id = ids[i];
                var entity = entities[id];
                if (!filterBy) {
                    map[id] = entity;
                    return "continue";
                }
                var allPass = coerceArray(filterBy).every(function (fn) { return fn(entity, i); });
                if (allPass) {
                    map[id] = entity;
                }
            };
            for (var i = 0; i < finalLength; i++) {
                _loop_2(i);
            }
        }
        return map;
    }

    var EntityActions;
    (function (EntityActions) {
        EntityActions["Set"] = "Set";
        EntityActions["Add"] = "Add";
        EntityActions["Update"] = "Update";
        EntityActions["Remove"] = "Remove";
    })(EntityActions || (EntityActions = {}));

    // @internal
    function getActiveEntities(idOrOptions, ids, currentActive) {
        var result;
        if (isArray(idOrOptions)) {
            result = idOrOptions;
        }
        else {
            if (isObject(idOrOptions)) {
                if (isNil(currentActive))
                    return;
                idOrOptions = Object.assign({ wrap: true }, idOrOptions);
                var currentIdIndex = ids.indexOf(currentActive);
                if (idOrOptions.prev) {
                    var isFirst = currentIdIndex === 0;
                    if (isFirst && !idOrOptions.wrap)
                        return;
                    result = isFirst ? ids[ids.length - 1] : ids[currentIdIndex - 1];
                }
                else if (idOrOptions.next) {
                    var isLast = ids.length === currentIdIndex + 1;
                    if (isLast && !idOrOptions.wrap)
                        return;
                    result = isLast ? ids[0] : ids[currentIdIndex + 1];
                }
            }
            else {
                if (idOrOptions === currentActive)
                    return;
                result = idOrOptions;
            }
        }
        return result;
    }

    // @internal
    var getInitialEntitiesState = function () {
        return ({
            entities: {},
            ids: [],
            loading: true,
            error: null
        });
    };

    // @internal
    function isUndefined(value) {
        return value === undefined;
    }

    // @internal
    function removeEntities(_a) {
        var e_1, _b;
        var state = _a.state, ids = _a.ids;
        if (isNil(ids))
            return removeAllEntities(state);
        var entities = state.entities;
        var newEntities = {};
        try {
            for (var _c = __values(state.ids), _d = _c.next(); !_d.done; _d = _c.next()) {
                var id = _d.value;
                if (ids.includes(id) === false) {
                    newEntities[id] = entities[id];
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var newState = __assign(__assign({}, state), { entities: newEntities, ids: state.ids.filter(function (current) { return ids.includes(current) === false; }) });
        if (hasActiveState(state)) {
            newState.active = resolveActiveEntity(newState);
        }
        return newState;
    }
    // @internal
    function removeAllEntities(state) {
        return __assign(__assign({}, state), { entities: {}, ids: [], active: isMultiActiveState(state.active) ? [] : null });
    }

    // @internal
    function toEntitiesObject(entities, idKey, preAddEntity) {
        var e_1, _a;
        var acc = {
            entities: {},
            ids: []
        };
        try {
            for (var entities_1 = __values(entities), entities_1_1 = entities_1.next(); !entities_1_1.done; entities_1_1 = entities_1.next()) {
                var entity = entities_1_1.value;
                // evaluate the middleware first to support dynamic ids
                var current = preAddEntity(entity);
                acc.entities[current[idKey]] = current;
                acc.ids.push(current[idKey]);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (entities_1_1 && !entities_1_1.done && (_a = entities_1.return)) _a.call(entities_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return acc;
    }

    // @internal
    function isEntityState(state) {
        return state.entities && state.ids;
    }
    // @internal
    function applyMiddleware(entities, preAddEntity) {
        var e_1, _a;
        var mapped = {};
        try {
            for (var _b = __values(Object.keys(entities)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var id = _c.value;
                mapped[id] = preAddEntity(entities[id]);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return mapped;
    }
    // @internal
    function setEntities(_a) {
        var state = _a.state, entities = _a.entities, idKey = _a.idKey, preAddEntity = _a.preAddEntity, isNativePreAdd = _a.isNativePreAdd;
        var newEntities;
        var newIds;
        if (isArray(entities)) {
            var resolve = toEntitiesObject(entities, idKey, preAddEntity);
            newEntities = resolve.entities;
            newIds = resolve.ids;
        }
        else if (isEntityState(entities)) {
            newEntities = isNativePreAdd ? entities.entities : applyMiddleware(entities.entities, preAddEntity);
            newIds = entities.ids;
        }
        else {
            // it's an object
            newEntities = isNativePreAdd ? entities : applyMiddleware(entities, preAddEntity);
            newIds = Object.keys(newEntities).map(function (id) { return (isNaN(id) ? id : Number(id)); });
        }
        var newState = __assign(__assign({}, state), { entities: newEntities, ids: newIds, loading: false });
        if (hasActiveState(state)) {
            newState.active = resolveActiveEntity(newState);
        }
        return newState;
    }

    // @internal
    function deepFreeze(o) {
        Object.freeze(o);
        var oIsFunction = typeof o === 'function';
        var hasOwnProp = Object.prototype.hasOwnProperty;
        Object.getOwnPropertyNames(o).forEach(function (prop) {
            if (hasOwnProp.call(o, prop) &&
                (oIsFunction ? prop !== 'caller' && prop !== 'callee' && prop !== 'arguments' : true) &&
                o[prop] !== null &&
                (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
                !Object.isFrozen(o[prop])) {
                deepFreeze(o[prop]);
            }
        });
        return o;
    }

    // @internal
    /** @class */ ((function (_super) {
        __extends(AkitaError, _super);
        function AkitaError(message) {
            return _super.call(this, message) || this;
        }
        return AkitaError;
    })(Error));
    // @internal
    function assertStoreHasName(name, className) {
        if (!name) {
            console.error("@StoreConfig({ name }) is missing in " + className);
        }
    }

    // @internal
    function toBoolean(value) {
        return value != null && "" + value !== 'false';
    }

    // @internal
    function isPlainObject(value) {
        return toBoolean(value) && value.constructor.name === 'Object';
    }

    var configKey = 'akitaConfig';

    // @internal
    var transactionFinished = new Subject();
    // @internal
    var transactionInProcess = new BehaviorSubject(false);
    // @internal
    var transactionManager = {
        activeTransactions: 0,
        batchTransaction: null
    };
    // @internal
    function startBatch() {
        if (!isTransactionInProcess()) {
            transactionManager.batchTransaction = new Subject();
        }
        transactionManager.activeTransactions++;
        transactionInProcess.next(true);
    }
    // @internal
    function endBatch() {
        if (--transactionManager.activeTransactions === 0) {
            transactionManager.batchTransaction.next(true);
            transactionManager.batchTransaction.complete();
            transactionInProcess.next(false);
            transactionFinished.next(true);
        }
    }
    // @internal
    function isTransactionInProcess() {
        return transactionManager.activeTransactions > 0;
    }
    // @internal
    function commit() {
        return transactionManager.batchTransaction ? transactionManager.batchTransaction.asObservable() : of(true);
    }
    /**
     *  A logical transaction.
     *  Use this transaction to optimize the dispatch of all the stores.
     *  The following code will update the store, BUT  emits only once
     *
     *  @example
     *  applyTransaction(() => {
     *    this.todosStore.add(new Todo(1, title));
     *    this.todosStore.add(new Todo(2, title));
     *  });
     *
     */
    function applyTransaction(action, thisArg) {
        if (thisArg === void 0) { thisArg = undefined; }
        startBatch();
        try {
            return action.apply(thisArg);
        }
        finally {
            logAction('@Transaction');
            endBatch();
        }
    }
    /**
     *  A logical transaction.
     *  Use this transaction to optimize the dispatch of all the stores.
     *
     *  The following code will update the store, BUT  emits only once.
     *
     *  @example
     *  @transaction
     *  addTodos() {
     *    this.todosStore.add(new Todo(1, title));
     *    this.todosStore.add(new Todo(2, title));
     *  }
     *
     *
     */
    function transaction() {
        return function (target, propertyKey, descriptor) {
            var originalMethod = descriptor.value;
            descriptor.value = function () {
                var _this = this;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return applyTransaction(function () {
                    return originalMethod.apply(_this, args);
                }, this);
            };
            return descriptor;
        };
    }

    /**
     *
     * Store for managing any type of data
     *
     * @example
     *
     * export interface SessionState {
     *   token: string;
     *   userDetails: UserDetails
     * }
     *
     * export function createInitialState(): SessionState {
     *  return {
     *    token: '',
     *    userDetails: null
     *  };
     * }
     *
     * @StoreConfig({ name: 'session' })
     * export class SessionStore extends Store<SessionState> {
     *   constructor() {
     *    super(createInitialState());
     *   }
     * }
     */
    var Store = /** @class */ (function () {
        function Store(initialState, options) {
            if (options === void 0) { options = {}; }
            this.options = options;
            this.inTransaction = false;
            this.cache = {
                active: new BehaviorSubject(false),
                ttl: null,
            };
            this.onInit(initialState);
        }
        /**
         *  Set the loading state
         *
         *  @example
         *
         *  store.setLoading(true)
         *
         */
        Store.prototype.setLoading = function (loading) {
            if (loading === void 0) { loading = false; }
            if (loading !== this._value().loading) {
                setAction('Set Loading');
                this._setState(function (state) { return (__assign(__assign({}, state), { loading: loading })); });
            }
        };
        /**
         *
         * Set whether the data is cached
         *
         * @example
         *
         * store.setHasCache(true)
         * store.setHasCache(false)
         * store.setHasCache(true, { restartTTL: true })
         *
         */
        Store.prototype.setHasCache = function (hasCache, options) {
            var _this = this;
            if (options === void 0) { options = { restartTTL: false }; }
            if (hasCache !== this.cache.active.value) {
                this.cache.active.next(hasCache);
            }
            if (options.restartTTL) {
                var ttlConfig = this.getCacheTTL();
                if (ttlConfig) {
                    if (this.cache.ttl !== null) {
                        clearTimeout(this.cache.ttl);
                    }
                    this.cache.ttl = setTimeout(function () { return _this.setHasCache(false); }, ttlConfig);
                }
            }
        };
        /**
         *
         * Sometimes we need to access the store value from a store
         *
         * @example middleware
         *
         */
        Store.prototype.getValue = function () {
            return this.storeValue;
        };
        /**
         *  Set the error state
         *
         *  @example
         *
         *  store.setError({text: 'unable to load data' })
         *
         */
        Store.prototype.setError = function (error) {
            if (error !== this._value().error) {
                setAction('Set Error');
                this._setState(function (state) { return (__assign(__assign({}, state), { error: error })); });
            }
        };
        // @internal
        Store.prototype._select = function (project) {
            return this.store.asObservable().pipe(map(function (snapshot) { return project(snapshot.state); }), distinctUntilChanged());
        };
        // @internal
        Store.prototype._value = function () {
            return this.storeValue;
        };
        // @internal
        Store.prototype._cache = function () {
            return this.cache.active;
        };
        Object.defineProperty(Store.prototype, "config", {
            // @internal
            get: function () {
                return this.constructor[configKey] || {};
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Store.prototype, "storeName", {
            // @internal
            get: function () {
                return this.config.storeName || this.options.storeName || this.options.name;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Store.prototype, "deepFreeze", {
            // @internal
            get: function () {
                return this.config.deepFreezeFn || this.options.deepFreezeFn || deepFreeze;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Store.prototype, "cacheConfig", {
            // @internal
            get: function () {
                return this.config.cache || this.options.cache;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Store.prototype, "_producerFn", {
            get: function () {
                return this.config.producerFn || this.options.producerFn || getGlobalProducerFn();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Store.prototype, "resettable", {
            // @internal
            get: function () {
                return isDefined(this.config.resettable) ? this.config.resettable : this.options.resettable;
            },
            enumerable: false,
            configurable: true
        });
        // @internal
        Store.prototype._setState = function (newState, _dispatchAction) {
            var _this = this;
            if (_dispatchAction === void 0) { _dispatchAction = true; }
            if (isFunction(newState)) {
                var _newState = newState(this._value());
                this.storeValue = this.deepFreeze(_newState) ;
            }
            else {
                this.storeValue = newState;
            }
            if (!this.store) {
                this.store = new BehaviorSubject({ state: this.storeValue });
                {
                    this.store.subscribe(function (_a) {
                        var action = _a.action;
                        if (action) {
                            dispatchUpdate(_this.storeName, action);
                        }
                    });
                }
                return;
            }
            if (isTransactionInProcess()) {
                this.handleTransaction();
                return;
            }
            this.dispatch(this.storeValue, _dispatchAction);
        };
        /**
         *
         * Reset the current store back to the initial value
         *
         * @example
         *
         * store.reset()
         *
         */
        Store.prototype.reset = function () {
            var _this = this;
            if (this.isResettable()) {
                setAction('Reset');
                this._setState(function () { return Object.assign({}, _this._initialState); });
                this.setHasCache(false);
            }
            else {
                console.warn("You need to enable the reset functionality");
            }
        };
        Store.prototype.update = function (stateOrCallback) {
            setAction('Update');
            var newState;
            var currentState = this._value();
            if (isFunction(stateOrCallback)) {
                newState = isFunction(this._producerFn) ? this._producerFn(currentState, stateOrCallback) : stateOrCallback(currentState);
            }
            else {
                newState = stateOrCallback;
            }
            var withHook = this.akitaPreUpdate(currentState, __assign(__assign({}, currentState), newState));
            var resolved = isPlainObject(currentState) ? withHook : new currentState.constructor(withHook);
            this._setState(resolved);
        };
        Store.prototype.updateStoreConfig = function (newOptions) {
            this.options = __assign(__assign({}, this.options), newOptions);
        };
        // @internal
        Store.prototype.akitaPreUpdate = function (_, nextState) {
            return nextState;
        };
        /**
         *
         * @deprecated
         *
         * This method will be removed in v7
         *
         * Akita isn't coupled to Angular and should not use Angular
         * specific code
         *
         */
        Store.prototype.ngOnDestroy = function () {
            this.destroy();
        };
        /**
         *
         * Destroy the store
         *
         * @example
         *
         * store.destroy()
         *
         */
        Store.prototype.destroy = function () {
            var hmrEnabled = isBrowser ? window.hmrEnabled : false;
            if (!hmrEnabled && this === __stores__[this.storeName]) {
                delete __stores__[this.storeName];
                dispatchDeleted(this.storeName);
                this.setHasCache(false);
                this.cache.active.complete();
                this.store.complete();
            }
        };
        Store.prototype.onInit = function (initialState) {
            __stores__[this.storeName] = this;
            this._setState(function () { return initialState; });
            dispatchAdded(this.storeName);
            if (this.isResettable()) {
                this._initialState = initialState;
            }
            assertStoreHasName(this.storeName, this.constructor.name);
        };
        Store.prototype.dispatch = function (state, _dispatchAction) {
            if (_dispatchAction === void 0) { _dispatchAction = true; }
            var action = undefined;
            if (_dispatchAction) {
                action = currentAction;
                resetCustomAction();
            }
            this.store.next({ state: state, action: action });
        };
        Store.prototype.watchTransaction = function () {
            var _this = this;
            commit().subscribe(function () {
                _this.inTransaction = false;
                _this.dispatch(_this._value());
            });
        };
        Store.prototype.isResettable = function () {
            if (this.resettable === false) {
                return false;
            }
            return this.resettable || getAkitaConfig().resettable;
        };
        Store.prototype.handleTransaction = function () {
            if (!this.inTransaction) {
                this.watchTransaction();
                this.inTransaction = true;
            }
        };
        Store.prototype.getCacheTTL = function () {
            return (this.cacheConfig && this.cacheConfig.ttl) || getAkitaConfig().ttl;
        };
        return Store;
    }());

    // @internal
    function updateEntities(_a) {
        var e_1, _b;
        var state = _a.state, ids = _a.ids, idKey = _a.idKey, newStateOrFn = _a.newStateOrFn, preUpdateEntity = _a.preUpdateEntity, producerFn = _a.producerFn, onEntityIdChanges = _a.onEntityIdChanges;
        var updatedEntities = {};
        var isUpdatingIdKey = false;
        var idToUpdate;
        try {
            for (var ids_1 = __values(ids), ids_1_1 = ids_1.next(); !ids_1_1.done; ids_1_1 = ids_1.next()) {
                var id = ids_1_1.value;
                // if the entity doesn't exist don't do anything
                if (hasEntity(state.entities, id) === false) {
                    continue;
                }
                var oldEntity = state.entities[id];
                var newState = void 0;
                if (isFunction(newStateOrFn)) {
                    newState = isFunction(producerFn) ? producerFn(oldEntity, newStateOrFn) : newStateOrFn(oldEntity);
                }
                else {
                    newState = newStateOrFn;
                }
                var isIdChanged = newState.hasOwnProperty(idKey) && newState[idKey] !== oldEntity[idKey];
                var newEntity = void 0;
                idToUpdate = id;
                if (isIdChanged) {
                    isUpdatingIdKey = true;
                    idToUpdate = newState[idKey];
                }
                var merged = __assign(__assign({}, oldEntity), newState);
                if (isPlainObject(oldEntity)) {
                    newEntity = merged;
                }
                else {
                    /**
                     * In case that new state is class of it's own, there's
                     * a possibility that it will be different than the old
                     * class.
                     * For example, Old state is an instance of animal class
                     * and new state is instance of person class.
                     * To avoid run over new person class with the old animal
                     * class we check if the new state is a class of it's own.
                     * If so, use it. Otherwise, use the old state class
                     */
                    if (isPlainObject(newState)) {
                        newEntity = new oldEntity.constructor(merged);
                    }
                    else {
                        newEntity = new newState.constructor(merged);
                    }
                }
                updatedEntities[idToUpdate] = preUpdateEntity(oldEntity, newEntity);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (ids_1_1 && !ids_1_1.done && (_b = ids_1.return)) _b.call(ids_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var updatedIds = state.ids;
        var stateEntities = state.entities;
        if (isUpdatingIdKey) {
            var _c = __read(ids, 1), id_1 = _c[0];
            var _d = state.entities, _e = id_1; _d[_e]; var rest = __rest(_d, [typeof _e === "symbol" ? _e : _e + ""]);
            stateEntities = rest;
            updatedIds = state.ids.map(function (current) { return (current === id_1 ? idToUpdate : current); });
            onEntityIdChanges(id_1, idToUpdate);
        }
        return __assign(__assign({}, state), { entities: __assign(__assign({}, stateEntities), updatedEntities), ids: updatedIds });
    }

    /**
     *
     * Store for managing a collection of entities
     *
     * @example
     *
     * export interface WidgetsState extends EntityState<Widget> { }
     *
     * @StoreConfig({ name: 'widgets' })
     *  export class WidgetsStore extends EntityStore<WidgetsState> {
     *   constructor() {
     *     super();
     *   }
     * }
     *
     *
     */
    var EntityStore = /** @class */ (function (_super) {
        __extends(EntityStore, _super);
        function EntityStore(initialState, options) {
            if (initialState === void 0) { initialState = {}; }
            if (options === void 0) { options = {}; }
            var _this = _super.call(this, __assign(__assign({}, getInitialEntitiesState()), initialState), options) || this;
            _this.options = options;
            _this.entityActions = new Subject();
            _this.entityIdChanges = new Subject();
            return _this;
        }
        Object.defineProperty(EntityStore.prototype, "selectEntityAction$", {
            // @internal
            get: function () {
                return this.entityActions.asObservable();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(EntityStore.prototype, "selectEntityIdChanges$", {
            // @internal
            get: function () {
                return this.entityIdChanges.asObservable();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(EntityStore.prototype, "idKey", {
            // @internal
            get: function () {
                return this.config.idKey || this.options.idKey || DEFAULT_ID_KEY;
            },
            enumerable: false,
            configurable: true
        });
        /**
         *
         * Replace current collection with provided collection
         *
         * @example
         *
         * this.store.set([Entity, Entity])
         * this.store.set({ids: [], entities: {}})
         * this.store.set({ 1: {}, 2: {}})
         *
         */
        EntityStore.prototype.set = function (entities, options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            if (isNil(entities))
                return;
            setAction('Set Entity');
            var isNativePreAdd = this.akitaPreAddEntity === EntityStore.prototype.akitaPreAddEntity;
            this.setHasCache(true, { restartTTL: true });
            this._setState(function (state) {
                var newState = setEntities({
                    state: state,
                    entities: entities,
                    idKey: _this.idKey,
                    preAddEntity: _this.akitaPreAddEntity,
                    isNativePreAdd: isNativePreAdd,
                });
                if (isUndefined(options.activeId) === false) {
                    newState.active = options.activeId;
                }
                return newState;
            });
            if (this.hasInitialUIState()) {
                this.handleUICreation();
            }
            this.entityActions.next({ type: EntityActions.Set, ids: this.ids });
        };
        /**
         * Add entities
         *
         * @example
         *
         * this.store.add([Entity, Entity])
         * this.store.add(Entity)
         * this.store.add(Entity, { prepend: true })
         *
         * this.store.add(Entity, { loading: false })
         */
        EntityStore.prototype.add = function (entities, options) {
            if (options === void 0) { options = { loading: false }; }
            var collection = coerceArray(entities);
            if (isEmpty(collection))
                return;
            var data = addEntities({
                state: this._value(),
                preAddEntity: this.akitaPreAddEntity,
                entities: collection,
                idKey: this.idKey,
                options: options,
            });
            if (data) {
                setAction('Add Entity');
                data.newState.loading = options.loading;
                this._setState(function () { return data.newState; });
                if (this.hasInitialUIState()) {
                    this.handleUICreation(true);
                }
                this.entityActions.next({ type: EntityActions.Add, ids: data.newIds });
            }
        };
        EntityStore.prototype.update = function (idsOrFnOrState, newStateOrFn) {
            var _this = this;
            if (isUndefined(newStateOrFn)) {
                _super.prototype.update.call(this, idsOrFnOrState);
                return;
            }
            var ids = [];
            if (isFunction(idsOrFnOrState)) {
                // We need to filter according the predicate function
                ids = this.ids.filter(function (id) { return idsOrFnOrState(_this.entities[id]); });
            }
            else {
                // If it's nil we want all of them
                ids = isNil(idsOrFnOrState) ? this.ids : coerceArray(idsOrFnOrState);
            }
            if (isEmpty(ids))
                return;
            setAction('Update Entity', ids);
            var entityIdChanged;
            this._setState(function (state) {
                return updateEntities({
                    idKey: _this.idKey,
                    ids: ids,
                    preUpdateEntity: _this.akitaPreUpdateEntity,
                    state: state,
                    newStateOrFn: newStateOrFn,
                    producerFn: _this._producerFn,
                    onEntityIdChanges: function (oldId, newId) {
                        entityIdChanged = { oldId: oldId, newId: newId };
                        _this.entityIdChanges.next(__assign(__assign({}, entityIdChanged), { pending: true }));
                    },
                });
            });
            if (entityIdChanged) {
                this.entityIdChanges.next(__assign(__assign({}, entityIdChanged), { pending: false }));
            }
            this.entityActions.next({ type: EntityActions.Update, ids: ids });
        };
        EntityStore.prototype.upsert = function (ids, newState, onCreate, options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            var toArray = coerceArray(ids);
            var predicate = function (isUpdate) { return function (id) { return hasEntity(_this.entities, id) === isUpdate; }; };
            var baseClass = isFunction(onCreate) ? options.baseClass : onCreate ? onCreate.baseClass : undefined;
            var isClassBased = isFunction(baseClass);
            var updateIds = toArray.filter(predicate(true));
            var newEntities = toArray.filter(predicate(false)).map(function (id) {
                var _a;
                var newStateObj = typeof newState === 'function' ? newState({}) : newState;
                var entity = isFunction(onCreate) ? onCreate(id, newStateObj) : newStateObj;
                var withId = __assign(__assign({}, entity), (_a = {}, _a[_this.idKey] = id, _a));
                if (isClassBased) {
                    return new baseClass(withId);
                }
                return withId;
            });
            // it can be any of the three types
            this.update(updateIds, newState);
            this.add(newEntities);
            logAction('Upsert Entity');
        };
        /**
         *
         * Upsert entity collection (idKey must be present)
         *
         * @example
         *
         * store.upsertMany([ { id: 1 }, { id: 2 }]);
         *
         * store.upsertMany([ { id: 1 }, { id: 2 }], { loading: true  });
         * store.upsertMany([ { id: 1 }, { id: 2 }], { baseClass: Todo  });
         *
         */
        EntityStore.prototype.upsertMany = function (entities, options) {
            var e_1, _a;
            if (options === void 0) { options = {}; }
            var addedIds = [];
            var updatedIds = [];
            var updatedEntities = {};
            try {
                // Update the state directly to optimize performance
                for (var entities_1 = __values(entities), entities_1_1 = entities_1.next(); !entities_1_1.done; entities_1_1 = entities_1.next()) {
                    var entity = entities_1_1.value;
                    var withPreCheckHook = this.akitaPreCheckEntity(entity);
                    var id = withPreCheckHook[this.idKey];
                    if (hasEntity(this.entities, id)) {
                        var prev = this._value().entities[id];
                        var merged = __assign(__assign({}, this._value().entities[id]), withPreCheckHook);
                        var next = options.baseClass ? new options.baseClass(merged) : merged;
                        var withHook = this.akitaPreUpdateEntity(prev, next);
                        var nextId = withHook[this.idKey];
                        updatedEntities[nextId] = withHook;
                        updatedIds.push(nextId);
                    }
                    else {
                        var newEntity = options.baseClass ? new options.baseClass(withPreCheckHook) : withPreCheckHook;
                        var withHook = this.akitaPreAddEntity(newEntity);
                        var nextId = withHook[this.idKey];
                        addedIds.push(nextId);
                        updatedEntities[nextId] = withHook;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (entities_1_1 && !entities_1_1.done && (_a = entities_1.return)) _a.call(entities_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            logAction('Upsert Many');
            this._setState(function (state) { return (__assign(__assign({}, state), { ids: addedIds.length ? __spread(state.ids, addedIds) : state.ids, entities: __assign(__assign({}, state.entities), updatedEntities), loading: !!options.loading })); });
            updatedIds.length && this.entityActions.next({ type: EntityActions.Update, ids: updatedIds });
            addedIds.length && this.entityActions.next({ type: EntityActions.Add, ids: addedIds });
            if (addedIds.length && this.hasUIStore()) {
                this.handleUICreation(true);
            }
        };
        /**
         *
         * Replace one or more entities (except the id property)
         *
         *
         * @example
         *
         * this.store.replace(5, newEntity)
         * this.store.replace([1,2,3], newEntity)
         */
        EntityStore.prototype.replace = function (ids, newState) {
            var e_2, _a, _b;
            var toArray = coerceArray(ids);
            if (isEmpty(toArray))
                return;
            var replaced = {};
            try {
                for (var toArray_1 = __values(toArray), toArray_1_1 = toArray_1.next(); !toArray_1_1.done; toArray_1_1 = toArray_1.next()) {
                    var id = toArray_1_1.value;
                    replaced[id] = __assign(__assign({}, newState), (_b = {}, _b[this.idKey] = id, _b));
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (toArray_1_1 && !toArray_1_1.done && (_a = toArray_1.return)) _a.call(toArray_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            setAction('Replace Entity', ids);
            this._setState(function (state) { return (__assign(__assign({}, state), { entities: __assign(__assign({}, state.entities), replaced) })); });
        };
        /**
         *
         * Move entity inside the collection
         *
         *
         * @example
         *
         * this.store.move(fromIndex, toIndex)
         */
        EntityStore.prototype.move = function (from, to) {
            var ids = this.ids.slice();
            ids.splice(to < 0 ? ids.length + to : to, 0, ids.splice(from, 1)[0]);
            setAction('Move Entity');
            this._setState(function (state) { return (__assign(__assign({}, state), { 
                // Change the entities reference so that selectAll emit
                entities: __assign({}, state.entities), ids: ids })); });
        };
        EntityStore.prototype.remove = function (idsOrFn) {
            var _this = this;
            if (isEmpty(this.ids))
                return;
            var idPassed = isDefined(idsOrFn);
            // null means remove all
            var ids = [];
            if (isFunction(idsOrFn)) {
                ids = this.ids.filter(function (entityId) { return idsOrFn(_this.entities[entityId]); });
            }
            else {
                ids = idPassed ? coerceArray(idsOrFn) : this.ids;
            }
            if (isEmpty(ids))
                return;
            setAction('Remove Entity', ids);
            this._setState(function (state) { return removeEntities({ state: state, ids: ids }); });
            if (!idPassed) {
                this.setHasCache(false);
            }
            this.handleUIRemove(ids);
            this.entityActions.next({ type: EntityActions.Remove, ids: ids });
        };
        /**
         *
         * Update the active entity
         *
         * @example
         *
         * this.store.updateActive({ completed: true })
         * this.store.updateActive(active => {
         *   return {
         *     config: {
         *      ..active.config,
         *      date
         *     }
         *   }
         * })
         */
        EntityStore.prototype.updateActive = function (newStateOrCallback) {
            var ids = coerceArray(this.active);
            setAction('Update Active', ids);
            this.update(ids, newStateOrCallback);
        };
        EntityStore.prototype.setActive = function (idOrOptions) {
            var active = getActiveEntities(idOrOptions, this.ids, this.active);
            if (active === undefined) {
                return;
            }
            setAction('Set Active', active);
            this._setActive(active);
        };
        /**
         * Add active entities
         *
         * @example
         *
         * store.addActive(2);
         * store.addActive([3, 4, 5]);
         */
        EntityStore.prototype.addActive = function (ids) {
            var _this = this;
            var toArray = coerceArray(ids);
            if (isEmpty(toArray))
                return;
            var everyExist = toArray.every(function (id) { return _this.active.indexOf(id) > -1; });
            if (everyExist)
                return;
            setAction('Add Active', ids);
            this._setState(function (state) {
                /** Protect against case that one of the items in the array exist */
                var uniques = Array.from(new Set(__spread(state.active, toArray)));
                return __assign(__assign({}, state), { active: uniques });
            });
        };
        /**
         * Remove active entities
         *
         * @example
         *
         * store.removeActive(2)
         * store.removeActive([3, 4, 5])
         */
        EntityStore.prototype.removeActive = function (ids) {
            var _this = this;
            var toArray = coerceArray(ids);
            if (isEmpty(toArray))
                return;
            var someExist = toArray.some(function (id) { return _this.active.indexOf(id) > -1; });
            if (!someExist)
                return;
            setAction('Remove Active', ids);
            this._setState(function (state) {
                return __assign(__assign({}, state), { active: Array.isArray(state.active) ? state.active.filter(function (currentId) { return toArray.indexOf(currentId) === -1; }) : null });
            });
        };
        /**
         * Toggle active entities
         *
         * @example
         *
         * store.toggle(2)
         * store.toggle([3, 4, 5])
         */
        EntityStore.prototype.toggleActive = function (ids) {
            var _this = this;
            var toArray = coerceArray(ids);
            var filterExists = function (remove) { return function (id) { return _this.active.includes(id) === remove; }; };
            var remove = toArray.filter(filterExists(true));
            var add = toArray.filter(filterExists(false));
            this.removeActive(remove);
            this.addActive(add);
            logAction('Toggle Active');
        };
        /**
         *
         * Create sub UI store for managing Entity's UI state
         *
         * @example
         *
         * export type ProductUI = {
         *   isLoading: boolean;
         *   isOpen: boolean
         * }
         *
         * interface ProductsUIState extends EntityState<ProductUI> {}
         *
         * export class ProductsStore EntityStore<ProductsState, Product> {
         *   ui: EntityUIStore<ProductsUIState, ProductUI>;
         *
         *   constructor() {
         *     super();
         *     this.createUIStore();
         *   }
         *
         * }
         */
        EntityStore.prototype.createUIStore = function (initialState, storeConfig) {
            if (initialState === void 0) { initialState = {}; }
            if (storeConfig === void 0) { storeConfig = {}; }
            var defaults = { name: "UI/" + this.storeName, idKey: this.idKey };
            this.ui = new EntityUIStore(initialState, __assign(__assign({}, defaults), storeConfig));
            return this.ui;
        };
        // @internal
        EntityStore.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            if (this.ui instanceof EntityStore) {
                this.ui.destroy();
            }
            this.entityActions.complete();
        };
        // @internal
        EntityStore.prototype.akitaPreUpdateEntity = function (_, nextEntity) {
            return nextEntity;
        };
        // @internal
        EntityStore.prototype.akitaPreAddEntity = function (newEntity) {
            return newEntity;
        };
        // @internal
        EntityStore.prototype.akitaPreCheckEntity = function (newEntity) {
            return newEntity;
        };
        Object.defineProperty(EntityStore.prototype, "ids", {
            get: function () {
                return this._value().ids;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(EntityStore.prototype, "entities", {
            get: function () {
                return this._value().entities;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(EntityStore.prototype, "active", {
            get: function () {
                return this._value().active;
            },
            enumerable: false,
            configurable: true
        });
        EntityStore.prototype._setActive = function (ids) {
            this._setState(function (state) {
                return __assign(__assign({}, state), { active: ids });
            });
        };
        EntityStore.prototype.handleUICreation = function (add) {
            var _this = this;
            if (add === void 0) { add = false; }
            var ids = this.ids;
            var isFunc = isFunction(this.ui._akitaCreateEntityFn);
            var uiEntities;
            var createFn = function (id) {
                var _a;
                var current = _this.entities[id];
                var ui = isFunc ? _this.ui._akitaCreateEntityFn(current) : _this.ui._akitaCreateEntityFn;
                return __assign((_a = {}, _a[_this.idKey] = current[_this.idKey], _a), ui);
            };
            if (add) {
                uiEntities = this.ids.filter(function (id) { return isUndefined(_this.ui.entities[id]); }).map(createFn);
            }
            else {
                uiEntities = ids.map(createFn);
            }
            add ? this.ui.add(uiEntities) : this.ui.set(uiEntities);
        };
        EntityStore.prototype.hasInitialUIState = function () {
            return this.hasUIStore() && isUndefined(this.ui._akitaCreateEntityFn) === false;
        };
        EntityStore.prototype.handleUIRemove = function (ids) {
            if (this.hasUIStore()) {
                this.ui.remove(ids);
            }
        };
        EntityStore.prototype.hasUIStore = function () {
            return this.ui instanceof EntityUIStore;
        };
        var _b;
        __decorate([
            transaction(),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Object, Object, Object, Object]),
            __metadata("design:returntype", void 0)
        ], EntityStore.prototype, "upsert", null);
        __decorate([
            transaction(),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [typeof (_b = typeof T !== "undefined" && T) === "function" ? _b : Object]),
            __metadata("design:returntype", void 0)
        ], EntityStore.prototype, "toggleActive", null);
        return EntityStore;
    }(Store));
    // @internal
    var EntityUIStore = /** @class */ (function (_super) {
        __extends(EntityUIStore, _super);
        function EntityUIStore(initialState, storeConfig) {
            if (initialState === void 0) { initialState = {}; }
            if (storeConfig === void 0) { storeConfig = {}; }
            return _super.call(this, initialState, storeConfig) || this;
        }
        /**
         *
         * Set the initial UI entity state. This function will determine the entity's
         * initial state when we call `set()` or `add()`.
         *
         * @example
         *
         * constructor() {
         *   super();
         *   this.createUIStore().setInitialEntityState(entity => ({ isLoading: false, isOpen: true }));
         *   this.createUIStore().setInitialEntityState({ isLoading: false, isOpen: true });
         * }
         *
         */
        EntityUIStore.prototype.setInitialEntityState = function (createFn) {
            this._akitaCreateEntityFn = createFn;
        };
        return EntityUIStore;
    }(EntityStore));
    /**
     * @example
     *
     * query.selectEntity(2).pipe(filterNilValue())
     */
    function filterNilValue() {
        return filter(function (value) { return value !== null && value !== undefined; });
    }

    var queryConfigKey = 'akitaQueryConfig';

    // @internal
    function isString(value) {
        return typeof value === 'string';
    }

    function compareKeys(keysOrFuncs) {
        return function (prevState, currState) {
            var isFns = isFunction(keysOrFuncs[0]);
            // Return when they are NOT changed
            return keysOrFuncs.some(function (keyOrFunc) {
                if (isFns) {
                    return keyOrFunc(prevState) !== keyOrFunc(currState);
                }
                return prevState[keyOrFunc] !== currState[keyOrFunc];
            }) === false;
        };
    }

    var Query = /** @class */ (function () {
        function Query(store) {
            this.store = store;
            this.__store__ = store;
            {
                // @internal
                __queries__[store.storeName] = this;
            }
        }
        Query.prototype.select = function (project) {
            var mapFn;
            if (isFunction(project)) {
                mapFn = project;
            }
            else if (isString(project)) {
                mapFn = function (state) { return state[project]; };
            }
            else if (Array.isArray(project)) {
                return this.store
                    ._select(function (state) { return state; })
                    .pipe(distinctUntilChanged(compareKeys(project)), map(function (state) {
                    if (isFunction(project[0])) {
                        return project.map(function (func) { return func(state); });
                    }
                    return project.reduce(function (acc, k) {
                        acc[k] = state[k];
                        return acc;
                    }, {});
                }));
            }
            else {
                mapFn = function (state) { return state; };
            }
            return this.store._select(mapFn);
        };
        /**
         * Select the loading state
         *
         * @example
         *
         * this.query.selectLoading().subscribe(isLoading => {})
         */
        Query.prototype.selectLoading = function () {
            return this.select(function (state) { return state.loading; });
        };
        /**
         * Select the error state
         *
         * @example
         *
         * this.query.selectError().subscribe(error => {})
         */
        Query.prototype.selectError = function () {
            return this.select(function (state) { return state.error; });
        };
        /**
         * Get the store's value
         *
         * @example
         *
         * this.query.getValue()
         *
         */
        Query.prototype.getValue = function () {
            return this.store._value();
        };
        /**
         * Select the cache state
         *
         * @example
         *
         * this.query.selectHasCache().pipe(
         *   switchMap(hasCache => {
         *     return hasCache ? of() : http().pipe(res => store.set(res))
         *   })
         * )
         */
        Query.prototype.selectHasCache = function () {
            return this.store._cache().asObservable();
        };
        /**
         * Whether we've cached data
         *
         * @example
         *
         * this.query.getHasCache()
         *
         */
        Query.prototype.getHasCache = function () {
            return this.store._cache().value;
        };
        Object.defineProperty(Query.prototype, "config", {
            // @internal
            get: function () {
                return this.constructor[queryConfigKey];
            },
            enumerable: false,
            configurable: true
        });
        return Query;
    }());

    // @internal
    function findEntityByPredicate(predicate, entities) {
        var e_1, _a;
        try {
            for (var _b = __values(Object.keys(entities)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var entityId = _c.value;
                if (predicate(entities[entityId]) === true) {
                    return entityId;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return undefined;
    }
    // @internal
    function getEntity(id, project) {
        return function (entities) {
            var entity = entities[id];
            if (isUndefined(entity)) {
                return undefined;
            }
            if (!project) {
                return entity;
            }
            if (isString(project)) {
                return entity[project];
            }
            return project(entity);
        };
    }

    // @internal
    function mapSkipUndefined(arr, callbackFn) {
        return arr.reduce(function (result, value, index, array) {
            var val = callbackFn(value, index, array);
            if (val !== undefined) {
                result.push(val);
            }
            return result;
        }, []);
    }

    // @internal
    function sortByOptions(options, config) {
        options.sortBy = options.sortBy || (config && config.sortBy);
        options.sortByOrder = options.sortByOrder || (config && config.sortByOrder);
    }

    /**
     *
     *  The Entity Query is similar to the general Query, with additional functionality tailored for EntityStores.
     *
     *  class WidgetsQuery extends QueryEntity<WidgetsState> {
     *     constructor(protected store: WidgetsStore) {
     *       super(store);
     *     }
     *  }
     *
     *
     *
     */
    var QueryEntity = /** @class */ (function (_super) {
        __extends(QueryEntity, _super);
        function QueryEntity(store, options) {
            if (options === void 0) { options = {}; }
            var _this = _super.call(this, store) || this;
            _this.options = options;
            _this.__store__ = store;
            return _this;
        }
        QueryEntity.prototype.selectAll = function (options) {
            var _this = this;
            if (options === void 0) { options = {
                asObject: false,
            }; }
            return this.select(function (state) { return state.entities; }).pipe(map(function () { return _this.getAll(options); }));
        };
        QueryEntity.prototype.getAll = function (options) {
            if (options === void 0) { options = { asObject: false, filterBy: undefined, limitTo: undefined }; }
            if (options.asObject) {
                return entitiesToMap(this.getValue(), options);
            }
            sortByOptions(options, this.config || this.options);
            return entitiesToArray(this.getValue(), options);
        };
        QueryEntity.prototype.selectMany = function (ids, project) {
            if (!ids || !ids.length)
                return of([]);
            return this.select(function (state) { return state.entities; }).pipe(map(function (entities) { return mapSkipUndefined(ids, function (id) { return getEntity(id, project)(entities); }); }), distinctUntilArrayItemChanged());
        };
        QueryEntity.prototype.selectEntity = function (idOrPredicate, project) {
            var id = idOrPredicate;
            if (isFunction(idOrPredicate)) {
                // For performance reason we expect the entity to be in the store
                id = findEntityByPredicate(idOrPredicate, this.getValue().entities);
            }
            return this.select(function (state) { return state.entities; }).pipe(map(getEntity(id, project)), distinctUntilChanged());
        };
        /**
         * Get an entity by id
         *
         * @example
         *
         * this.query.getEntity(1);
         */
        QueryEntity.prototype.getEntity = function (id) {
            return this.getValue().entities[id];
        };
        /**
         * Select the active entity's id
         *
         * @example
         *
         * this.query.selectActiveId()
         */
        QueryEntity.prototype.selectActiveId = function () {
            return this.select(function (state) { return state.active; });
        };
        /**
         * Get the active id
         *
         * @example
         *
         * this.query.getActiveId()
         */
        QueryEntity.prototype.getActiveId = function () {
            return this.getValue().active;
        };
        QueryEntity.prototype.selectActive = function (project) {
            var _this = this;
            if (isArray(this.getActive())) {
                return this.selectActiveId().pipe(switchMap(function (ids) { return _this.selectMany(ids, project); }));
            }
            return this.selectActiveId().pipe(switchMap(function (ids) { return _this.selectEntity(ids, project); }));
        };
        QueryEntity.prototype.getActive = function () {
            var _this = this;
            var activeId = this.getActiveId();
            if (isArray(activeId)) {
                return activeId.map(function (id) { return _this.getValue().entities[id]; });
            }
            return toBoolean(activeId) ? this.getEntity(activeId) : undefined;
        };
        /**
         * Select the store's entity collection length
         *
         * @example
         *
         * this.query.selectCount()
         * this.query.selectCount(entity => entity.completed)
         */
        QueryEntity.prototype.selectCount = function (predicate) {
            var _this = this;
            return this.select(function (state) { return state.entities; }).pipe(map(function () { return _this.getCount(predicate); }));
        };
        /**
         * Get the store's entity collection length
         *
         * @example
         *
         * this.query.getCount()
         * this.query.getCount(entity => entity.completed)
         */
        QueryEntity.prototype.getCount = function (predicate) {
            if (isFunction(predicate)) {
                return this.getAll().filter(predicate).length;
            }
            return this.getValue().ids.length;
        };
        QueryEntity.prototype.selectLast = function (project) {
            return this.selectAt(function (ids) { return ids[ids.length - 1]; }, project);
        };
        QueryEntity.prototype.selectFirst = function (project) {
            return this.selectAt(function (ids) { return ids[0]; }, project);
        };
        QueryEntity.prototype.selectEntityAction = function (actionOrActions) {
            if (isNil(actionOrActions)) {
                return this.store.selectEntityAction$;
            }
            var project = isArray(actionOrActions) ? function (action) { return action; } : function (_a) {
                var ids = _a.ids;
                return ids;
            };
            var actions = coerceArray(actionOrActions);
            return this.store.selectEntityAction$.pipe(filter(function (_a) {
                var type = _a.type;
                return actions.includes(type);
            }), map(function (action) { return project(action); }));
        };
        QueryEntity.prototype.hasEntity = function (projectOrIds) {
            var _this = this;
            if (isNil(projectOrIds)) {
                return this.getValue().ids.length > 0;
            }
            if (isFunction(projectOrIds)) {
                return this.getAll().some(projectOrIds);
            }
            if (isArray(projectOrIds)) {
                return projectOrIds.every(function (id) { return id in _this.getValue().entities; });
            }
            return projectOrIds in this.getValue().entities;
        };
        /**
         * Returns whether entity store has an active entity
         *
         * @example
         *
         * this.query.hasActive()
         * this.query.hasActive(3)
         *
         */
        QueryEntity.prototype.hasActive = function (id) {
            var active = this.getValue().active;
            var isIdProvided = isDefined(id);
            if (Array.isArray(active)) {
                if (isIdProvided) {
                    return active.includes(id);
                }
                return active.length > 0;
            }
            return isIdProvided ? active === id : isDefined(active);
        };
        /**
         *
         * Create sub UI query for querying Entity's UI state
         *
         * @example
         *
         *
         * export class ProductsQuery extends QueryEntity<ProductsState> {
         *   ui: EntityUIQuery<ProductsUIState>;
         *
         *   constructor(protected store: ProductsStore) {
         *     super(store);
         *     this.createUIQuery();
         *   }
         *
         * }
         */
        QueryEntity.prototype.createUIQuery = function () {
            this.ui = new EntityUIQuery(this.__store__.ui);
        };
        QueryEntity.prototype.selectAt = function (mapFn, project) {
            var _this = this;
            return this.select(function (state) { return state.ids; }).pipe(map(mapFn), distinctUntilChanged(), switchMap(function (id) { return _this.selectEntity(id, project); }));
        };
        return QueryEntity;
    }(Query));
    // @internal
    var EntityUIQuery = /** @class */ (function (_super) {
        __extends(EntityUIQuery, _super);
        function EntityUIQuery(store) {
            return _super.call(this, store) || this;
        }
        return EntityUIQuery;
    }(QueryEntity));
    function createEntityStore(initialState, options) {
        return new EntityStore(initialState, options);
    }
    function createEntityQuery(store, options) {
        if (options === void 0) { options = {}; }
        return new QueryEntity(store, options);
    }

    /**
     * @internal
     *
     * @example
     *
     * getValue(state, 'todos.ui')
     *
     */
    function getValue(obj, prop) {
        /** return the whole state  */
        if (prop.split('.').length === 1) {
            return obj;
        }
        var removeStoreName = prop
            .split('.')
            .slice(1)
            .join('.');
        return removeStoreName.split('.').reduce(function (acc, part) { return acc && acc[part]; }, obj);
    }

    /**
     * @internal
     *
     * @example
     * setValue(state, 'todos.ui', { filter: {} })
     */
    function setValue(obj, prop, val, replace) {
        if (replace === void 0) { replace = false; }
        var split = prop.split('.');
        if (split.length === 1) {
            return __assign(__assign({}, obj), val);
        }
        obj = __assign({}, obj);
        var lastIndex = split.length - 2;
        var removeStoreName = prop.split('.').slice(1);
        removeStoreName.reduce(function (acc, part, index) {
            if (index !== lastIndex) {
                acc[part] = __assign({}, acc[part]);
                return acc && acc[part];
            }
            acc[part] = replace || Array.isArray(acc[part]) || !isObject(acc[part]) ? val : __assign(__assign({}, acc[part]), val);
            return acc && acc[part];
        }, obj);
        return obj;
    }

    var skipStorageUpdate = false;
    var _persistStateInit = new ReplaySubject(1);
    function getSkipStorageUpdate() {
        return skipStorageUpdate;
    }
    function isPromise(v) {
        return v && isFunction(v.then);
    }
    function observify(asyncOrValue) {
        if (isPromise(asyncOrValue) || isObservable(asyncOrValue)) {
            return from(asyncOrValue);
        }
        return of(asyncOrValue);
    }
    function persistState(params) {
        var defaults = {
            key: 'AkitaStores',
            enableInNonBrowser: false,
            storage: !hasLocalStorage() ? params.storage : localStorage,
            deserialize: JSON.parse,
            serialize: JSON.stringify,
            include: [],
            select: [],
            persistOnDestroy: false,
            preStorageUpdate: function (storeName, state) {
                return state;
            },
            preStoreUpdate: function (storeName, state) {
                return state;
            },
            skipStorageUpdate: getSkipStorageUpdate,
            preStorageUpdateOperator: function () { return function (source) { return source; }; },
        };
        var _a = Object.assign({}, defaults, params), storage = _a.storage, enableInNonBrowser = _a.enableInNonBrowser, deserialize = _a.deserialize, serialize = _a.serialize, include = _a.include, select = _a.select, key = _a.key, preStorageUpdate = _a.preStorageUpdate, persistOnDestroy = _a.persistOnDestroy, preStorageUpdateOperator = _a.preStorageUpdateOperator, preStoreUpdate = _a.preStoreUpdate, skipStorageUpdate = _a.skipStorageUpdate;
        if ((isNotBrowser && !enableInNonBrowser) || !storage)
            return;
        var hasInclude = include.length > 0;
        var hasSelect = select.length > 0;
        var includeStores;
        var selectStores;
        if (hasInclude) {
            includeStores = include.reduce(function (acc, path) {
                if (isFunction(path)) {
                    acc.fns.push(path);
                }
                else {
                    var storeName = path.split('.')[0];
                    acc[storeName] = path;
                }
                return acc;
            }, { fns: [] });
        }
        if (hasSelect) {
            selectStores = select.reduce(function (acc, selectFn) {
                acc[selectFn.storeName] = selectFn;
                return acc;
            }, {});
        }
        var stores = {};
        var acc = {};
        var subscriptions = [];
        var buffer = [];
        function _save(v) {
            observify(v).subscribe(function () {
                var next = buffer.shift();
                next && _save(next);
            });
        }
        // when we use the local/session storage we perform the serialize, otherwise we let the passed storage implementation to do it
        var isLocalStorage = (hasLocalStorage() && storage === localStorage) || (hasSessionStorage() && storage === sessionStorage);
        observify(storage.getItem(key)).subscribe(function (value) {
            var storageState = isObject(value) ? value : deserialize(value || '{}');
            function save(storeCache) {
                storageState['$cache'] = __assign(__assign({}, (storageState['$cache'] || {})), storeCache);
                storageState = Object.assign({}, storageState, acc);
                buffer.push(storage.setItem(key, isLocalStorage ? serialize(storageState) : storageState));
                _save(buffer.shift());
            }
            function subscribe(storeName, path) {
                stores[storeName] = __stores__[storeName]
                    ._select(function (state) { return getValue(state, path); })
                    .pipe(skip(1), map(function (store) {
                    if (hasSelect && selectStores[storeName]) {
                        return selectStores[storeName](store);
                    }
                    return store;
                }), filter(function () { return skipStorageUpdate() === false; }), preStorageUpdateOperator())
                    .subscribe(function (data) {
                    acc[storeName] = preStorageUpdate(storeName, data);
                    Promise.resolve().then(function () {
                        var _a;
                        return save((_a = {}, _a[storeName] = __stores__[storeName]._cache().getValue(), _a));
                    });
                });
            }
            function setInitial(storeName, store, path) {
                if (storeName in storageState) {
                    setAction('@PersistState');
                    store._setState(function (state) {
                        return setValue(state, path, preStoreUpdate(storeName, storageState[storeName], state));
                    });
                    var hasCache = storageState['$cache'] ? storageState['$cache'][storeName] : false;
                    __stores__[storeName].setHasCache(hasCache, { restartTTL: true });
                }
            }
            subscriptions.push($$deleteStore.subscribe(function (storeName) {
                var _a;
                if (stores[storeName]) {
                    if (persistOnDestroy === false) {
                        save((_a = {}, _a[storeName] = false, _a));
                    }
                    stores[storeName].unsubscribe();
                    delete stores[storeName];
                }
            }));
            subscriptions.push($$addStore.subscribe(function (storeName) {
                if (storeName === 'router') {
                    return;
                }
                var store = __stores__[storeName];
                if (hasInclude) {
                    var path = includeStores[storeName];
                    if (!path) {
                        var passPredicate = includeStores.fns.some(function (fn) { return fn(storeName); });
                        if (passPredicate) {
                            path = storeName;
                        }
                        else {
                            return;
                        }
                    }
                    setInitial(storeName, store, path);
                    subscribe(storeName, path);
                }
                else {
                    setInitial(storeName, store, storeName);
                    subscribe(storeName, storeName);
                }
            }));
            _persistStateInit.next();
        });
        return {
            destroy: function () {
                subscriptions.forEach(function (s) { return s.unsubscribe(); });
                for (var i = 0, keys = Object.keys(stores); i < keys.length; i++) {
                    var storeName = keys[i];
                    stores[storeName].unsubscribe();
                }
                stores = {};
            },
            clear: function () {
                storage.clear();
            },
            clearStore: function (storeName) {
                if (isNil(storeName)) {
                    var value_1 = observify(storage.setItem(key, '{}'));
                    value_1.subscribe();
                    return;
                }
                var value = storage.getItem(key);
                observify(value).subscribe(function (v) {
                    var storageState = deserialize(v || '{}');
                    if (storageState[storeName]) {
                        delete storageState[storeName];
                        var value_2 = observify(storage.setItem(key, serialize(storageState)));
                        value_2.subscribe();
                    }
                });
            },
        };
    }

    var AkitaPlugin = /** @class */ (function () {
        function AkitaPlugin(query, config) {
            this.query = query;
            if (config && config.resetFn) ;
        }
        /** This method is responsible for getting access to the query. */
        AkitaPlugin.prototype.getQuery = function () {
            return this.query;
        };
        /** This method is responsible for getting access to the store. */
        AkitaPlugin.prototype.getStore = function () {
            return this.getQuery().__store__;
        };
        /** This method is responsible tells whether the plugin is entityBased or not.  */
        AkitaPlugin.prototype.isEntityBased = function (entityId) {
            return toBoolean(entityId);
        };
        /** This method is responsible for selecting the source; it can be the whole store or one entity. */
        AkitaPlugin.prototype.selectSource = function (entityId, property) {
            var _this = this;
            if (this.isEntityBased(entityId)) {
                return this.getQuery().selectEntity(entityId).pipe(filterNilValue());
            }
            if (property) {
                return this.getQuery().select(function (state) { return getValue(state, _this.withStoreName(property)); });
            }
            return this.getQuery().select();
        };
        AkitaPlugin.prototype.getSource = function (entityId, property) {
            if (this.isEntityBased(entityId)) {
                return this.getQuery().getEntity(entityId);
            }
            var state = this.getQuery().getValue();
            if (property) {
                return getValue(state, this.withStoreName(property));
            }
            return state;
        };
        AkitaPlugin.prototype.withStoreName = function (prop) {
            return this.storeName + "." + prop;
        };
        Object.defineProperty(AkitaPlugin.prototype, "storeName", {
            get: function () {
                return this.getStore().storeName;
            },
            enumerable: false,
            configurable: true
        });
        /** This method is responsible for updating the store or one entity; it can be the whole store or one entity. */
        AkitaPlugin.prototype.updateStore = function (newState, entityId, property, replace) {
            var _this = this;
            if (replace === void 0) { replace = false; }
            if (this.isEntityBased(entityId)) {
                var store = this.getStore();
                replace ? store.replace(entityId, newState) : store.update(entityId, newState);
            }
            else {
                if (property) {
                    this.getStore()._setState(function (state) {
                        return setValue(state, _this.withStoreName(property), newState, true);
                    });
                    return;
                }
                var nextState = replace ? newState : function (state) { return (__assign(__assign({}, state), newState)); };
                this.getStore()._setState(nextState);
            }
        };
        /**
         * Function to invoke upon reset
         */
        AkitaPlugin.prototype.onReset = function (fn) {
            var _this = this;
            var original = this.getStore().reset;
            this.getStore().reset = function () {
                var params = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    params[_i] = arguments[_i];
                }
                /** It should run after the plugin destroy method */
                setTimeout(function () {
                    original.apply(_this.getStore(), params);
                    fn();
                });
            };
        };
        return AkitaPlugin;
    }());

    var ɵ0 = function (head, current) { return JSON.stringify(head) !== JSON.stringify(current); };
    var dirtyCheckDefaultParams = {
        comparator: ɵ0,
    };
    function getNestedPath(nestedObj, path) {
        var pathAsArray = path.split('.');
        return pathAsArray.reduce(function (obj, key) { return (obj && obj[key] !== 'undefined' ? obj[key] : undefined); }, nestedObj);
    }
    var DirtyCheckPlugin = /** @class */ (function (_super) {
        __extends(DirtyCheckPlugin, _super);
        function DirtyCheckPlugin(query, params, _entityId) {
            var _this = _super.call(this, query) || this;
            _this.query = query;
            _this.params = params;
            _this._entityId = _entityId;
            _this.dirty = new BehaviorSubject(false);
            _this.active = false;
            _this._reset = new Subject();
            _this.isDirty$ = _this.dirty.asObservable().pipe(distinctUntilChanged());
            _this.reset$ = _this._reset.asObservable();
            _this.params = __assign(__assign({}, dirtyCheckDefaultParams), params);
            if (_this.params.watchProperty) {
                var watchProp = coerceArray(_this.params.watchProperty);
                if (query instanceof QueryEntity && watchProp.includes('entities') && !watchProp.includes('ids')) {
                    watchProp.push('ids');
                }
                _this.params.watchProperty = watchProp;
            }
            return _this;
        }
        DirtyCheckPlugin.prototype.reset = function (params) {
            if (params === void 0) { params = {}; }
            var currentValue = this.head;
            if (isFunction(params.updateFn)) {
                if (this.isEntityBased(this._entityId)) {
                    currentValue = params.updateFn(this.head, this.getQuery().getEntity(this._entityId));
                }
                else {
                    currentValue = params.updateFn(this.head, this.getQuery().getValue());
                }
            }
            logAction("@DirtyCheck - Revert");
            this.updateStore(currentValue, this._entityId);
            this._reset.next();
        };
        DirtyCheckPlugin.prototype.setHead = function () {
            if (!this.active) {
                this.activate();
                this.active = true;
            }
            else {
                this.head = this._getHead();
            }
            this.updateDirtiness(false);
            return this;
        };
        DirtyCheckPlugin.prototype.isDirty = function () {
            return !!this.dirty.value;
        };
        DirtyCheckPlugin.prototype.hasHead = function () {
            return !!this.getHead();
        };
        DirtyCheckPlugin.prototype.destroy = function () {
            this.head = null;
            this.subscription && this.subscription.unsubscribe();
            this._reset && this._reset.complete();
        };
        DirtyCheckPlugin.prototype.isPathDirty = function (path) {
            var head = this.getHead();
            var current = this.getQuery().getValue();
            var currentPathValue = getNestedPath(current, path);
            var headPathValue = getNestedPath(head, path);
            return this.params.comparator(currentPathValue, headPathValue);
        };
        DirtyCheckPlugin.prototype.getHead = function () {
            return this.head;
        };
        DirtyCheckPlugin.prototype.activate = function () {
            var _this = this;
            this.head = this._getHead();
            /** if we are tracking specific properties select only the relevant ones */
            var source = this.params.watchProperty
                ? this.params.watchProperty.map(function (prop) {
                    return _this.query
                        .select(function (state) { return state[prop]; })
                        .pipe(map(function (val) { return ({
                        val: val,
                        __akitaKey: prop,
                    }); }));
                })
                : [this.selectSource(this._entityId)];
            this.subscription = combineLatest.apply(void 0, __spread(source)).pipe(skip(1))
                .subscribe(function (currentState) {
                if (isUndefined(_this.head))
                    return;
                /** __akitaKey is used to determine if we are tracking a specific property or a store change */
                var isChange = currentState.some(function (state) {
                    var head = state.__akitaKey ? _this.head[state.__akitaKey] : _this.head;
                    var compareTo = state.__akitaKey ? state.val : state;
                    return _this.params.comparator(head, compareTo);
                });
                _this.updateDirtiness(isChange);
            });
        };
        DirtyCheckPlugin.prototype.updateDirtiness = function (isDirty) {
            this.dirty.next(isDirty);
        };
        DirtyCheckPlugin.prototype._getHead = function () {
            var head = this.getSource(this._entityId);
            if (this.params.watchProperty) {
                head = this.getWatchedValues(head);
            }
            return head;
        };
        DirtyCheckPlugin.prototype.getWatchedValues = function (source) {
            return this.params.watchProperty.reduce(function (watched, prop) {
                watched[prop] = source[prop];
                return watched;
            }, {});
        };
        return DirtyCheckPlugin;
    }(AkitaPlugin));

    /**
     * Each plugin that wants to add support for entities should extend this interface.
     */
    var EntityCollectionPlugin = /** @class */ (function () {
        function EntityCollectionPlugin(query, entityIds) {
            this.query = query;
            this.entityIds = entityIds;
            this.entities = new Map();
        }
        /**
         * Get the entity plugin instance.
         */
        EntityCollectionPlugin.prototype.getEntity = function (id) {
            return this.entities.get(id);
        };
        /**
         * Whether the entity plugin exist.
         */
        EntityCollectionPlugin.prototype.hasEntity = function (id) {
            return this.entities.has(id);
        };
        /**
         * Remove the entity plugin instance.
         */
        EntityCollectionPlugin.prototype.removeEntity = function (id) {
            this.destroy(id);
            return this.entities.delete(id);
        };
        /**
         * Set the entity plugin instance.
         */
        EntityCollectionPlugin.prototype.createEntity = function (id, plugin) {
            return this.entities.set(id, plugin);
        };
        /**
         * If the user passes `entityIds` we take them; otherwise, we take all.
         */
        EntityCollectionPlugin.prototype.getIds = function () {
            return isUndefined(this.entityIds) ? this.query.getValue().ids : coerceArray(this.entityIds);
        };
        /**
         * When you call one of the plugin methods, you can pass id/ids or undefined which means all.
         */
        EntityCollectionPlugin.prototype.resolvedIds = function (ids) {
            return isUndefined(ids) ? this.getIds() : coerceArray(ids);
        };
        /**
         * Call this method when you want to activate the plugin on init or when you need to listen to add/remove of entities dynamically.
         *
         * For example in your plugin you may do the following:
         *
         * this.query.select(state => state.ids).pipe(skip(1)).subscribe(ids => this.activate(ids));
         */
        EntityCollectionPlugin.prototype.rebase = function (ids, actions) {
            var _this = this;
            if (actions === void 0) { actions = {}; }
            /**
             *
             * If the user passes `entityIds` & we have new ids check if we need to add/remove instances.
             *
             * This phase will be called only upon update.
             */
            if (toBoolean(ids)) {
                /**
                 * Which means all
                 */
                if (isUndefined(this.entityIds)) {
                    for (var i = 0, len = ids.length; i < len; i++) {
                        var entityId = ids[i];
                        if (this.hasEntity(entityId) === false) {
                            isFunction(actions.beforeAdd) && actions.beforeAdd(entityId);
                            var plugin = this.instantiatePlugin(entityId);
                            this.entities.set(entityId, plugin);
                            isFunction(actions.afterAdd) && actions.afterAdd(plugin);
                        }
                    }
                    this.entities.forEach(function (plugin, entityId) {
                        if (ids.indexOf(entityId) === -1) {
                            isFunction(actions.beforeRemove) && actions.beforeRemove(plugin);
                            _this.removeEntity(entityId);
                        }
                    });
                }
                else {
                    /**
                     * Which means the user passes specific ids
                     */
                    var _ids = coerceArray(this.entityIds);
                    for (var i = 0, len = _ids.length; i < len; i++) {
                        var entityId = _ids[i];
                        /** The Entity in current ids and doesn't exist, add it. */
                        if (ids.indexOf(entityId) > -1 && this.hasEntity(entityId) === false) {
                            isFunction(actions.beforeAdd) && actions.beforeAdd(entityId);
                            var plugin = this.instantiatePlugin(entityId);
                            this.entities.set(entityId, plugin);
                            isFunction(actions.afterAdd) && actions.afterAdd(plugin);
                        }
                        else {
                            this.entities.forEach(function (plugin, entityId) {
                                /** The Entity not in current ids and exists, remove it. */
                                if (ids.indexOf(entityId) === -1 && _this.hasEntity(entityId) === true) {
                                    isFunction(actions.beforeRemove) && actions.beforeRemove(plugin);
                                    _this.removeEntity(entityId);
                                }
                            });
                        }
                    }
                }
            }
            else {
                /**
                 * Otherwise, start with the provided ids or all.
                 */
                this.getIds().forEach(function (id) {
                    if (!_this.hasEntity(id))
                        _this.createEntity(id, _this.instantiatePlugin(id));
                });
            }
        };
        /**
         * Listen for add/remove entities.
         */
        EntityCollectionPlugin.prototype.selectIds = function () {
            return this.query.select(function (state) { return state.ids; });
        };
        /**
         * Base method for activation, you can override it if you need to.
         */
        EntityCollectionPlugin.prototype.activate = function (ids) {
            this.rebase(ids);
        };
        /**
         * Loop over each id and invoke the plugin method.
         */
        EntityCollectionPlugin.prototype.forEachId = function (ids, cb) {
            var _ids = this.resolvedIds(ids);
            for (var i = 0, len = _ids.length; i < len; i++) {
                var id = _ids[i];
                if (this.hasEntity(id)) {
                    cb(this.getEntity(id));
                }
            }
        };
        return EntityCollectionPlugin;
    }());

    /** @class */ ((function (_super) {
        __extends(EntityDirtyCheckPlugin, _super);
        function EntityDirtyCheckPlugin(query, params) {
            if (params === void 0) { params = {}; }
            var _this = _super.call(this, query, params.entityIds) || this;
            _this.query = query;
            _this.params = params;
            _this._someDirty = new Subject();
            _this.someDirty$ = merge(_this.query.select(function (state) { return state.entities; }), _this._someDirty.asObservable()).pipe(auditTime(0), map(function () { return _this.checkSomeDirty(); }));
            _this.params = __assign(__assign({}, dirtyCheckDefaultParams), params);
            // TODO lazy activate?
            _this.activate();
            _this.selectIds()
                .pipe(skip(1))
                .subscribe(function (ids) {
                _super.prototype.rebase.call(_this, ids, { afterAdd: function (plugin) { return plugin.setHead(); } });
            });
            return _this;
        }
        EntityDirtyCheckPlugin.prototype.setHead = function (ids) {
            if (this.params.entityIds && ids) {
                var toArray_1 = coerceArray(ids);
                var someAreWatched = coerceArray(this.params.entityIds).some(function (id) { return toArray_1.indexOf(id) > -1; });
                if (someAreWatched === false) {
                    return this;
                }
            }
            this.forEachId(ids, function (e) { return e.setHead(); });
            this._someDirty.next();
            return this;
        };
        EntityDirtyCheckPlugin.prototype.hasHead = function (id) {
            if (this.entities.has(id)) {
                var entity = this.getEntity(id);
                return entity.hasHead();
            }
            return false;
        };
        EntityDirtyCheckPlugin.prototype.reset = function (ids, params) {
            if (params === void 0) { params = {}; }
            this.forEachId(ids, function (e) { return e.reset(params); });
        };
        EntityDirtyCheckPlugin.prototype.isDirty = function (id, asObservable) {
            if (asObservable === void 0) { asObservable = true; }
            if (this.entities.has(id)) {
                var entity = this.getEntity(id);
                return asObservable ? entity.isDirty$ : entity.isDirty();
            }
            return false;
        };
        EntityDirtyCheckPlugin.prototype.someDirty = function () {
            return this.checkSomeDirty();
        };
        EntityDirtyCheckPlugin.prototype.isPathDirty = function (id, path) {
            if (this.entities.has(id)) {
                var head = this.getEntity(id).getHead();
                var current = this.query.getEntity(id);
                var currentPathValue = getNestedPath(current, path);
                var headPathValue = getNestedPath(head, path);
                return this.params.comparator(currentPathValue, headPathValue);
            }
            return null;
        };
        EntityDirtyCheckPlugin.prototype.destroy = function (ids) {
            this.forEachId(ids, function (e) { return e.destroy(); });
            /** complete only when the plugin destroys */
            if (!ids) {
                this._someDirty.complete();
            }
        };
        EntityDirtyCheckPlugin.prototype.instantiatePlugin = function (id) {
            return new DirtyCheckPlugin(this.query, this.params, id);
        };
        EntityDirtyCheckPlugin.prototype.checkSomeDirty = function () {
            var e_1, _a;
            var entitiesIds = this.resolvedIds();
            try {
                for (var entitiesIds_1 = __values(entitiesIds), entitiesIds_1_1 = entitiesIds_1.next(); !entitiesIds_1_1.done; entitiesIds_1_1 = entitiesIds_1.next()) {
                    var id = entitiesIds_1_1.value;
                    if (this.getEntity(id).isDirty()) {
                        return true;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (entitiesIds_1_1 && !entitiesIds_1_1.done && (_a = entitiesIds_1.return)) _a.call(entitiesIds_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return false;
        };
        return EntityDirtyCheckPlugin;
    })(EntityCollectionPlugin));

    var paginatorDefaults = {
        pagesControls: false,
        range: false,
        startWith: 1,
        cacheTimeout: undefined,
        clearStoreWithCache: true,
    };
    /** @class */ ((function (_super) {
        __extends(PaginatorPlugin, _super);
        function PaginatorPlugin(query, config) {
            if (config === void 0) { config = {}; }
            var _this = _super.call(this, query, {
                resetFn: function () {
                    _this.initial = false;
                    _this.destroy({ clearCache: true, currentPage: 1 });
                },
            }) || this;
            _this.query = query;
            _this.config = config;
            /** Save current filters, sorting, etc. in cache */
            _this.metadata = new Map();
            _this.pages = new Map();
            _this.pagination = {
                currentPage: 1,
                perPage: 0,
                total: 0,
                lastPage: 0,
                data: [],
            };
            /**
             * When the user navigates to a different page and return
             * we don't want to call `clearCache` on first time.
             */
            _this.initial = true;
            /**
             * Proxy to the query loading
             */
            _this.isLoading$ = _this.query.selectLoading().pipe(delay(0));
            _this.config = __assign(__assign({}, paginatorDefaults), config);
            var _a = _this.config, startWith = _a.startWith, cacheTimeout = _a.cacheTimeout;
            _this.page = new BehaviorSubject(startWith);
            if (isObservable(cacheTimeout)) {
                _this.clearCacheSubscription = cacheTimeout.subscribe(function () { return _this.clearCache(); });
            }
            return _this;
        }
        Object.defineProperty(PaginatorPlugin.prototype, "pageChanges", {
            /**
             * Listen to page changes
             */
            get: function () {
                return this.page.asObservable();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PaginatorPlugin.prototype, "currentPage", {
            /**
             * Get the current page number
             */
            get: function () {
                return this.pagination.currentPage;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PaginatorPlugin.prototype, "isFirst", {
            /**
             * Check if current page is the first one
             */
            get: function () {
                return this.currentPage === 1;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PaginatorPlugin.prototype, "isLast", {
            /**
             * Check if current page is the last one
             */
            get: function () {
                return this.currentPage === this.pagination.lastPage;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Whether to generate an array of pages for *ngFor
         * [1, 2, 3, 4]
         */
        PaginatorPlugin.prototype.withControls = function () {
            this.config.pagesControls = true;
            return this;
        };
        /**
         * Whether to generate the `from` and `to` keys
         * [1, 2, 3, 4]
         */
        PaginatorPlugin.prototype.withRange = function () {
            this.config.range = true;
            return this;
        };
        /**
         * Set the loading state
         */
        PaginatorPlugin.prototype.setLoading = function (value) {
            if (value === void 0) { value = true; }
            this.getStore().setLoading(value);
        };
        /**
         * Update the pagination object and add the page
         */
        PaginatorPlugin.prototype.update = function (response) {
            this.pagination = response;
            this.addPage(response.data);
        };
        /**
         *
         * Set the ids and add the page to store
         */
        PaginatorPlugin.prototype.addPage = function (data) {
            var _this = this;
            this.pages.set(this.currentPage, { ids: data.map(function (entity) { return entity[_this.getStore().idKey]; }) });
            this.getStore().upsertMany(data);
        };
        /**
         * Clear the cache.
         */
        PaginatorPlugin.prototype.clearCache = function (options) {
            if (options === void 0) { options = {}; }
            if (!this.initial) {
                logAction('@Pagination - Clear Cache');
                if (options.clearStore !== false && (this.config.clearStoreWithCache || options.clearStore)) {
                    this.getStore().remove();
                }
                this.pages = new Map();
                this.metadata = new Map();
            }
            this.initial = false;
        };
        PaginatorPlugin.prototype.clearPage = function (page) {
            this.pages.delete(page);
        };
        /**
         * Clear the cache timeout and optionally the pages
         */
        PaginatorPlugin.prototype.destroy = function (_a) {
            var _b = _a === void 0 ? {} : _a, clearCache = _b.clearCache, currentPage = _b.currentPage;
            if (this.clearCacheSubscription) {
                this.clearCacheSubscription.unsubscribe();
            }
            if (clearCache) {
                this.clearCache();
            }
            if (!isUndefined(currentPage)) {
                this.setPage(currentPage);
            }
            this.initial = true;
        };
        /**
         * Whether the provided page is active
         */
        PaginatorPlugin.prototype.isPageActive = function (page) {
            return this.currentPage === page;
        };
        /**
         * Set the current page
         */
        PaginatorPlugin.prototype.setPage = function (page) {
            if (page !== this.currentPage || !this.hasPage(page)) {
                this.page.next((this.pagination.currentPage = page));
            }
        };
        /**
         * Increment current page
         */
        PaginatorPlugin.prototype.nextPage = function () {
            if (this.currentPage !== this.pagination.lastPage) {
                this.setPage(this.pagination.currentPage + 1);
            }
        };
        /**
         * Decrement current page
         */
        PaginatorPlugin.prototype.prevPage = function () {
            if (this.pagination.currentPage > 1) {
                this.setPage(this.pagination.currentPage - 1);
            }
        };
        /**
         * Set current page to last
         */
        PaginatorPlugin.prototype.setLastPage = function () {
            this.setPage(this.pagination.lastPage);
        };
        /**
         * Set current page to first
         */
        PaginatorPlugin.prototype.setFirstPage = function () {
            this.setPage(1);
        };
        /**
         * Check if page exists in cache
         */
        PaginatorPlugin.prototype.hasPage = function (page) {
            return this.pages.has(page);
        };
        /**
         * Get the current page if it's in cache, otherwise invoke the request
         */
        PaginatorPlugin.prototype.getPage = function (req) {
            var _this = this;
            var page = this.pagination.currentPage;
            if (this.hasPage(page)) {
                return this.selectPage(page);
            }
            else {
                this.setLoading(true);
                return from(req()).pipe(switchMap(function (config) {
                    page = config.currentPage;
                    applyTransaction(function () {
                        _this.setLoading(false);
                        _this.update(config);
                    });
                    return _this.selectPage(page);
                }));
            }
        };
        PaginatorPlugin.prototype.getQuery = function () {
            return this.query;
        };
        PaginatorPlugin.prototype.refreshCurrentPage = function () {
            if (isNil(this.currentPage) === false) {
                this.clearPage(this.currentPage);
                this.setPage(this.currentPage);
            }
        };
        PaginatorPlugin.prototype.getFrom = function () {
            if (this.isFirst) {
                return 1;
            }
            return (this.currentPage - 1) * this.pagination.perPage + 1;
        };
        PaginatorPlugin.prototype.getTo = function () {
            if (this.isLast) {
                return this.pagination.total;
            }
            return this.currentPage * this.pagination.perPage;
        };
        /**
         * Select the page
         */
        PaginatorPlugin.prototype.selectPage = function (page) {
            var _this = this;
            return this.query.selectAll({ asObject: true }).pipe(take(1), map(function (entities) {
                var response = __assign(__assign({}, _this.pagination), { data: _this.pages.get(page).ids.map(function (id) { return entities[id]; }) });
                var _a = _this.config, range = _a.range, pagesControls = _a.pagesControls;
                /** If no total - calc it */
                if (isNaN(_this.pagination.total)) {
                    if (response.lastPage === 1) {
                        response.total = response.data ? response.data.length : 0;
                    }
                    else {
                        response.total = response.perPage * response.lastPage;
                    }
                    _this.pagination.total = response.total;
                }
                if (range) {
                    response.from = _this.getFrom();
                    response.to = _this.getTo();
                }
                if (pagesControls) {
                    response.pageControls = generatePages(_this.pagination.total, _this.pagination.perPage);
                }
                return response;
            }));
        };
        __decorate([
            action('@Pagination - New Page'),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Object]),
            __metadata("design:returntype", void 0)
        ], PaginatorPlugin.prototype, "update", null);
        return PaginatorPlugin;
    })(AkitaPlugin));
    /**
     * Generate an array so we can ngFor them to navigate between pages
     */
    function generatePages(total, perPage) {
        var len = Math.ceil(total / perPage);
        var arr = [];
        for (var i = 0; i < len; i++) {
            arr.push(i + 1);
        }
        return arr;
    }

    /** @class */ ((function (_super) {
        __extends(PersistNgFormPlugin, _super);
        function PersistNgFormPlugin(query, factoryFnOrPath, params) {
            if (params === void 0) { params = {}; }
            var _this = _super.call(this, query) || this;
            _this.query = query;
            _this.factoryFnOrPath = factoryFnOrPath;
            _this.params = params;
            _this.params = __assign({ debounceTime: 300, formKey: 'akitaForm', emitEvent: false, arrControlFactory: function (v) { return _this.builder.control(v); } }, params);
            _this.isRootKeys = toBoolean(factoryFnOrPath) === false;
            _this.isKeyBased = isString(factoryFnOrPath) || _this.isRootKeys;
            return _this;
        }
        PersistNgFormPlugin.prototype.setForm = function (form, builder) {
            this.form = form;
            this.builder = builder;
            this.activate();
            return this;
        };
        PersistNgFormPlugin.prototype.reset = function (initialState) {
            var _a;
            var _this = this;
            var value;
            if (initialState) {
                value = initialState;
            }
            else {
                value = this.isKeyBased ? this.initialValue : this.factoryFnOrPath();
            }
            if (this.isKeyBased) {
                Object.keys(this.initialValue).forEach(function (stateKey) {
                    var value = _this.initialValue[stateKey];
                    if (Array.isArray(value) && _this.builder) {
                        var formArray = _this.form.controls[stateKey];
                        _this.cleanArray(formArray);
                        value.forEach(function (v, i) {
                            _this.form.get(stateKey).insert(i, _this.params.arrControlFactory(v));
                        });
                    }
                });
            }
            this.form.patchValue(value, { emitEvent: this.params.emitEvent });
            var storeValue = this.isKeyBased ? setValue(this.getQuery().getValue(), this.getStore().storeName + "." + this.factoryFnOrPath, value) : (_a = {}, _a[this.params.formKey] = value, _a);
            this.updateStore(storeValue);
        };
        PersistNgFormPlugin.prototype.cleanArray = function (control) {
            while (control.length !== 0) {
                control.removeAt(0);
            }
        };
        PersistNgFormPlugin.prototype.resolveInitialValue = function (formValue, root) {
            var _this = this;
            if (!formValue)
                return;
            return Object.keys(formValue).reduce(function (acc, stateKey) {
                var value = root[stateKey];
                if (Array.isArray(value) && _this.builder) {
                    var factory_1 = _this.params.arrControlFactory;
                    _this.cleanArray(_this.form.get(stateKey));
                    value.forEach(function (v, i) {
                        _this.form.get(stateKey).insert(i, factory_1(v));
                    });
                }
                acc[stateKey] = root[stateKey];
                return acc;
            }, {});
        };
        PersistNgFormPlugin.prototype.activate = function () {
            var _a;
            var _this = this;
            var path;
            if (this.isKeyBased) {
                if (this.isRootKeys) {
                    this.initialValue = this.resolveInitialValue(this.form.value, this.getQuery().getValue());
                    this.form.patchValue(this.initialValue, { emitEvent: this.params.emitEvent });
                }
                else {
                    path = this.getStore().storeName + "." + this.factoryFnOrPath;
                    var root = getValue(this.getQuery().getValue(), path);
                    this.initialValue = this.resolveInitialValue(root, root);
                    this.form.patchValue(this.initialValue, { emitEvent: this.params.emitEvent });
                }
            }
            else {
                if (!this.getQuery().getValue()[this.params.formKey]) {
                    logAction('@PersistNgFormPlugin activate');
                    this.updateStore((_a = {}, _a[this.params.formKey] = this.factoryFnOrPath(), _a));
                }
                var value = this.getQuery().getValue()[this.params.formKey];
                this.form.patchValue(value);
            }
            this.formChanges = this.form.valueChanges.pipe(debounceTime(this.params.debounceTime)).subscribe(function (value) {
                logAction('@PersistForm - Update');
                var newState;
                if (_this.isKeyBased) {
                    if (_this.isRootKeys) {
                        newState = function (state) { return (__assign(__assign({}, state), value)); };
                    }
                    else {
                        newState = function (state) { return setValue(state, path, value); };
                    }
                }
                else {
                    newState = function () {
                        var _a;
                        return (_a = {}, _a[_this.params.formKey] = value, _a);
                    };
                }
                _this.updateStore(newState(_this.getQuery().getValue()));
            });
        };
        PersistNgFormPlugin.prototype.destroy = function () {
            this.formChanges && this.formChanges.unsubscribe();
            this.form = null;
            this.builder = null;
        };
        return PersistNgFormPlugin;
    })(AkitaPlugin));

    var StateHistoryPlugin = /** @class */ (function (_super) {
        __extends(StateHistoryPlugin, _super);
        function StateHistoryPlugin(query, params, _entityId) {
            if (params === void 0) { params = {}; }
            var _this = _super.call(this, query, {
                resetFn: function () { return _this.clear(); },
            }) || this;
            _this.query = query;
            _this.params = params;
            _this._entityId = _entityId;
            /** Allow skipping an update from outside */
            _this.skip = false;
            _this.history = {
                past: [],
                present: null,
                future: [],
            };
            /** Skip the update when redo/undo */
            _this.skipUpdate = false;
            params.maxAge = !!params.maxAge ? params.maxAge : 10;
            params.comparator = params.comparator || (function () { return true; });
            _this.activate();
            return _this;
        }
        Object.defineProperty(StateHistoryPlugin.prototype, "hasPast$", {
            /**
             * Observable stream representing whether the history plugin has an available past
             *
             */
            get: function () {
                return this._hasPast$;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(StateHistoryPlugin.prototype, "hasFuture$", {
            /**
             * Observable stream representing whether the history plugin has an available future
             *
             */
            get: function () {
                return this._hasFuture$;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(StateHistoryPlugin.prototype, "hasPast", {
            get: function () {
                return this.history.past.length > 0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(StateHistoryPlugin.prototype, "hasFuture", {
            get: function () {
                return this.history.future.length > 0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(StateHistoryPlugin.prototype, "property", {
            get: function () {
                return this.params.watchProperty;
            },
            enumerable: false,
            configurable: true
        });
        /* Updates the hasPast$ hasFuture$ observables*/
        StateHistoryPlugin.prototype.updateHasHistory = function () {
            this.hasFutureSubject.next(this.hasFuture);
            this.hasPastSubject.next(this.hasPast);
        };
        StateHistoryPlugin.prototype.activate = function () {
            var _this = this;
            this.hasPastSubject = new BehaviorSubject(false);
            this._hasPast$ = this.hasPastSubject.asObservable().pipe(distinctUntilChanged());
            this.hasFutureSubject = new BehaviorSubject(false);
            this._hasFuture$ = this.hasFutureSubject.asObservable().pipe(distinctUntilChanged());
            this.history.present = this.getSource(this._entityId, this.property);
            this.subscription = this
                .selectSource(this._entityId, this.property)
                .pipe(pairwise())
                .subscribe(function (_a) {
                var _b = __read(_a, 2), past = _b[0], present = _b[1];
                if (_this.skip) {
                    _this.skip = false;
                    return;
                }
                /**
                 *  comparator: (prev, current) => isEqual(prev, current) === false
                 */
                var shouldUpdate = _this.params.comparator(past, present);
                if (!_this.skipUpdate && shouldUpdate) {
                    if (_this.history.past.length === _this.params.maxAge) {
                        _this.history.past = _this.history.past.slice(1);
                    }
                    _this.history.past = __spread(_this.history.past, [past]);
                    _this.history.present = present;
                    _this.updateHasHistory();
                }
            });
        };
        StateHistoryPlugin.prototype.undo = function () {
            if (this.history.past.length > 0) {
                var _a = this.history, past = _a.past, present = _a.present;
                var previous = past[past.length - 1];
                this.history.past = past.slice(0, past.length - 1);
                this.history.present = previous;
                this.history.future = __spread([present], this.history.future);
                this.update();
            }
        };
        StateHistoryPlugin.prototype.redo = function () {
            if (this.history.future.length > 0) {
                var _a = this.history, past = _a.past, present = _a.present;
                var next = this.history.future[0];
                var newFuture = this.history.future.slice(1);
                this.history.past = __spread(past, [present]);
                this.history.present = next;
                this.history.future = newFuture;
                this.update('Redo');
            }
        };
        StateHistoryPlugin.prototype.jumpToPast = function (index) {
            if (index < 0 || index >= this.history.past.length)
                return;
            var _a = this.history, past = _a.past, future = _a.future, present = _a.present;
            /**
             *
             * const past = [1, 2, 3, 4, 5];
             * const present = 6;
             * const future = [7, 8, 9];
             * const index = 2;
             *
             * newPast = past.slice(0, index) = [1, 2];
             * newPresent = past[index] = 3;
             * newFuture = [...past.slice(index + 1),present, ...future] = [4, 5, 6, 7, 8, 9];
             *
             */
            var newPast = past.slice(0, index);
            var newFuture = __spread(past.slice(index + 1), [present], future);
            var newPresent = past[index];
            this.history.past = newPast;
            this.history.present = newPresent;
            this.history.future = newFuture;
            this.update();
        };
        StateHistoryPlugin.prototype.jumpToFuture = function (index) {
            if (index < 0 || index >= this.history.future.length)
                return;
            var _a = this.history, past = _a.past, future = _a.future, present = _a.present;
            /**
             *
             * const past = [1, 2, 3, 4, 5];
             * const present = 6;
             * const future = [7, 8, 9, 10]
             * const index = 1
             *
             * newPast = [...past, present, ...future.slice(0, index) = [1, 2, 3, 4, 5, 6, 7];
             * newPresent = future[index] = 8;
             * newFuture = futrue.slice(index+1) = [9, 10];
             *
             */
            var newPast = __spread(past, [present], future.slice(0, index));
            var newPresent = future[index];
            var newFuture = future.slice(index + 1);
            this.history.past = newPast;
            this.history.present = newPresent;
            this.history.future = newFuture;
            this.update('Redo');
        };
        /**
         *
         * jump n steps in the past or forward
         *
         */
        StateHistoryPlugin.prototype.jump = function (n) {
            if (n > 0)
                return this.jumpToFuture(n - 1);
            if (n < 0)
                return this.jumpToPast(this.history.past.length + n);
        };
        /**
         * Clear the history
         *
         * @param customUpdateFn Callback function for only clearing part of the history
         *
         * @example
         *
         * stateHistory.clear((history) => {
         *  return {
         *    past: history.past,
         *    present: history.present,
         *    future: []
         *  };
         * });
         */
        StateHistoryPlugin.prototype.clear = function (customUpdateFn) {
            this.history = isFunction(customUpdateFn)
                ? customUpdateFn(this.history)
                : {
                    past: [],
                    present: null,
                    future: [],
                };
            this.updateHasHistory();
        };
        StateHistoryPlugin.prototype.destroy = function (clearHistory) {
            if (clearHistory === void 0) { clearHistory = false; }
            if (clearHistory) {
                this.clear();
            }
            this.subscription.unsubscribe();
        };
        StateHistoryPlugin.prototype.ignoreNext = function () {
            this.skip = true;
        };
        StateHistoryPlugin.prototype.update = function (action) {
            if (action === void 0) { action = 'Undo'; }
            this.skipUpdate = true;
            logAction("@StateHistory - " + action);
            this.updateStore(this.history.present, this._entityId, this.property, true);
            this.updateHasHistory();
            this.skipUpdate = false;
        };
        return StateHistoryPlugin;
    }(AkitaPlugin));

    /** @class */ ((function (_super) {
        __extends(EntityStateHistoryPlugin, _super);
        function EntityStateHistoryPlugin(query, params) {
            if (params === void 0) { params = {}; }
            var _this = _super.call(this, query, params.entityIds) || this;
            _this.query = query;
            _this.params = params;
            params.maxAge = toBoolean(params.maxAge) ? params.maxAge : 10;
            _this.activate();
            _this.selectIds()
                .pipe(skip(1))
                .subscribe(function (ids) { return _this.activate(ids); });
            return _this;
        }
        EntityStateHistoryPlugin.prototype.redo = function (ids) {
            this.forEachId(ids, function (e) { return e.redo(); });
        };
        EntityStateHistoryPlugin.prototype.undo = function (ids) {
            this.forEachId(ids, function (e) { return e.undo(); });
        };
        EntityStateHistoryPlugin.prototype.hasPast = function (id) {
            if (this.hasEntity(id)) {
                return this.getEntity(id).hasPast;
            }
        };
        EntityStateHistoryPlugin.prototype.hasFuture = function (id) {
            if (this.hasEntity(id)) {
                return this.getEntity(id).hasFuture;
            }
        };
        EntityStateHistoryPlugin.prototype.jumpToFuture = function (ids, index) {
            this.forEachId(ids, function (e) { return e.jumpToFuture(index); });
        };
        EntityStateHistoryPlugin.prototype.jumpToPast = function (ids, index) {
            this.forEachId(ids, function (e) { return e.jumpToPast(index); });
        };
        EntityStateHistoryPlugin.prototype.clear = function (ids) {
            this.forEachId(ids, function (e) { return e.clear(); });
        };
        EntityStateHistoryPlugin.prototype.destroy = function (ids, clearHistory) {
            if (clearHistory === void 0) { clearHistory = false; }
            this.forEachId(ids, function (e) { return e.destroy(clearHistory); });
        };
        EntityStateHistoryPlugin.prototype.ignoreNext = function (ids) {
            this.forEachId(ids, function (e) { return e.ignoreNext(); });
        };
        EntityStateHistoryPlugin.prototype.instantiatePlugin = function (id) {
            return new StateHistoryPlugin(this.query, this.params, id);
        };
        return EntityStateHistoryPlugin;
    })(EntityCollectionPlugin));

    var _a, _b;
    var StoreAction;
    (function (StoreAction) {
        StoreAction["Update"] = "UPDATE";
    })(StoreAction || (StoreAction = {}));
    (_a = {},
        _a[StoreAction.Update] = 'update',
        _a);
    var EntityStoreAction;
    (function (EntityStoreAction) {
        EntityStoreAction["Update"] = "UPDATE";
        EntityStoreAction["AddEntities"] = "ADD_ENTITIES";
        EntityStoreAction["SetEntities"] = "SET_ENTITIES";
        EntityStoreAction["UpdateEntities"] = "UPDATE_ENTITIES";
        EntityStoreAction["RemoveEntities"] = "REMOVE_ENTITIES";
        EntityStoreAction["UpsertEntities"] = "UPSERT_ENTITIES";
        EntityStoreAction["UpsertManyEntities"] = "UPSERT_MANY_ENTITIES";
    })(EntityStoreAction || (EntityStoreAction = {}));
    (_b = {},
        _b[EntityStoreAction.Update] = 'update',
        _b[EntityStoreAction.AddEntities] = 'add',
        _b[EntityStoreAction.SetEntities] = 'set',
        _b[EntityStoreAction.UpdateEntities] = 'update',
        _b[EntityStoreAction.RemoveEntities] = 'remove',
        _b[EntityStoreAction.UpsertEntities] = 'upsert',
        _b[EntityStoreAction.UpsertManyEntities] = 'upsertMany',
        _b);

    /* src\state\tetris\tetris.store.svelte generated by Svelte v3.42.2 */

    function create_fragment$j(ctx) {
    	const block = {
    		c: noop$1,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop$1,
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: noop$1
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }





    const createInitialState$1 = pieceFactory => ({
    	matrix: MatrixUtil.getStartBoard(),
    	current: null,
    	next: pieceFactory.getRandomPiece(),
    	points: 0,
    	locked: true,
    	sound: true,
    	initLine: 0,
    	clearedLines: 0,
    	initSpeed: 1,
    	speed: 1,
    	gameState: GameState.Loading,
    	saved: null,
    	max: maxPoint()
    });

    const TetrisStore = createEntityStore(createInitialState$1(new PieceFactory()), { name: "SvelteTetris" });

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tetris_store', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tetris_store> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		createEntityStore,
    		PieceFactory,
    		GameState,
    		MatrixUtil,
    		LocalStorageService,
    		createInitialState: createInitialState$1,
    		TetrisStore
    	});

    	return [];
    }

    class Tetris_store extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tetris_store",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    var _store = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Tetris_store,
        createInitialState: createInitialState$1,
        TetrisStore: TetrisStore
    });

    /* src\state\tetris\tetris.query.svelte generated by Svelte v3.42.2 */

    function create_fragment$i(ctx) {
    	const block = {
    		c: noop$1,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop$1,
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: noop$1
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }


    const TetrisQuery = createEntityQuery(TetrisStore);
    const next$ = TetrisQuery.select("next");
    const matrix$ = TetrisQuery.select("matrix");
    const sound$$1 = TetrisQuery.select("sound");
    const gameState$ = TetrisQuery.select("gameState");
    const hasCurrent$ = TetrisQuery.select("current").pipe(map(x => !!x));
    const points$ = TetrisQuery.select("points");
    const clearedLines$ = TetrisQuery.select("clearedLines");
    const initLine$ = TetrisQuery.select("initLine");
    const speed$ = TetrisQuery.select("speed");
    const initSpeed$ = TetrisQuery.select("initSpeed");
    const max$ = TetrisQuery.select("max");

    const isShowLogo$ = combineLatest([gameState$, TetrisQuery.select("current")]).pipe(switchMap(([state, current]) => {
    	const isLoadingOrOver = state === GameState.Loading || state === GameState.Over;
    	const isRenderingLogo$ = of(isLoadingOrOver && !current);

    	return isLoadingOrOver
    	? isRenderingLogo$.pipe(delay(1800))
    	: isRenderingLogo$;
    }));

    function raw() {
    	return TetrisQuery.getValue();
    }

    function locked() {
    	return raw().locked;
    }

    function current() {
    	return raw().current;
    }

    function next() {
    	return raw().next;
    }

    function matrix() {
    	return raw().matrix;
    }

    function canStartGame() {
    	return raw().gameState !== GameState.Started;
    }

    function isPlaying() {
    	return raw().gameState === GameState.Started;
    }

    function isPause() {
    	return raw().gameState === GameState.Paused;
    }

    function isEnableSound() {
    	return !!raw().sound;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tetris_query', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tetris_query> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		createEntityQuery,
    		QueryEntity,
    		TetrisStore,
    		GameState,
    		map,
    		delay,
    		switchMap,
    		combineLatest,
    		of,
    		TetrisQuery,
    		next$,
    		matrix$,
    		sound$: sound$$1,
    		gameState$,
    		hasCurrent$,
    		points$,
    		clearedLines$,
    		initLine$,
    		speed$,
    		initSpeed$,
    		max$,
    		isShowLogo$,
    		raw,
    		locked,
    		current,
    		next,
    		matrix,
    		canStartGame,
    		isPlaying,
    		isPause,
    		isEnableSound
    	});

    	return [];
    }

    class Tetris_query extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tetris_query",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    var _tetrisQuery = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Tetris_query,
        TetrisQuery: TetrisQuery,
        next$: next$,
        matrix$: matrix$,
        sound$: sound$$1,
        gameState$: gameState$,
        hasCurrent$: hasCurrent$,
        points$: points$,
        clearedLines$: clearedLines$,
        initLine$: initLine$,
        speed$: speed$,
        initSpeed$: initSpeed$,
        max$: max$,
        isShowLogo$: isShowLogo$,
        raw: raw,
        locked: locked,
        current: current,
        next: next,
        matrix: matrix,
        canStartGame: canStartGame,
        isPlaying: isPlaying,
        isPause: isPause,
        isEnableSound: isEnableSound
    });

    /* src\components\logo\logo.svelte generated by Svelte v3.42.2 */
    const file$d = "src\\components\\logo\\logo.svelte";

    function create_fragment$h(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let t0;
    	let p;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Press Space to start";
    			attr_dev(div0, "class", div0_class_value = "bg dragon " + /*className*/ ctx[0] + " svelte-kn35yz");
    			add_location(div0, file$d, 31, 2, 1120);
    			attr_dev(p, "class", "svelte-kn35yz");
    			add_location(p, file$d, 32, 2, 1161);
    			attr_dev(div1, "class", "logo svelte-kn35yz");
    			add_location(div1, file$d, 30, 0, 1098);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, p);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*className*/ 1 && div0_class_value !== (div0_class_value = "bg dragon " + /*className*/ ctx[0] + " svelte-kn35yz")) {
    				attr_dev(div0, "class", div0_class_value);
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Logo', slots, []);
    	let logo$;
    	let className = "";

    	function eyes() {
    		return timer(0, 500).pipe(startWith(0), map(x => x + 1), takeWhile(x => x < 6), tap(x => {
    			const state = x % 2 === 0 ? 1 : 2;
    			$$invalidate(0, className = `l${state}`);
    		}));
    	}

    	function run() {
    		let side = "r";

    		return timer(0, 100).pipe(
    			startWith(0),
    			map(x => x + 1),
    			takeWhile(x => x <= 40),
    			tap(x => {
    				if (x === 10 || x === 20 || x === 30) {
    					side = side === "r" ? "l" : "r";
    				}

    				const state = x % 2 === 0 ? 3 : 4;
    				$$invalidate(0, className = `${side}${state}`);
    			}),
    			finalize(() => {
    				$$invalidate(0, className = `${side}1`);
    			})
    		);
    	}

    	onMount(() => {
    		logo$ = concat(run(), eyes()).pipe(delay(5000), repeat(1000)).subscribe();
    	});

    	onDestroy(() => logo$.unsubscribe());
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Logo> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		concat,
    		Observable,
    		Subscription,
    		timer,
    		delay,
    		finalize,
    		map,
    		repeat,
    		startWith,
    		takeWhile,
    		tap,
    		onDestroy,
    		onMount,
    		_tetrisQuery,
    		logo$,
    		className,
    		eyes,
    		run
    	});

    	$$self.$inject_state = $$props => {
    		if ('logo$' in $$props) logo$ = $$props.logo$;
    		if ('className' in $$props) $$invalidate(0, className = $$props.className);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [className];
    }

    class Logo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Logo",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src\components\number\number.svelte generated by Svelte v3.42.2 */
    const file$c = "src\\components\\number\\number.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (15:2) {#each getNums as sequence}
    function create_each_block$3(ctx) {
    	let span;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", span_class_value = "bg num num-" + /*sequence*/ ctx[4] + " svelte-tsmjly");
    			add_location(span, file$c, 15, 4, 342);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*getNums*/ 1 && span_class_value !== (span_class_value = "bg num num-" + /*sequence*/ ctx[4] + " svelte-tsmjly")) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(15:2) {#each getNums as sequence}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div;
    	let each_value = /*getNums*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "number svelte-tsmjly");
    			add_location(div, file$c, 13, 0, 285);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*getNums*/ 1) {
    				each_value = /*getNums*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Number', slots, []);
    	let { num = 0 } = $$props;
    	let { length = 6 } = $$props;
    	let getNums;

    	function nums() {
    		const str = `${num}`;
    		return str.padStart(length, "n").split("");
    	}

    	beforeUpdate(() => {
    		$$invalidate(0, getNums = nums());
    	});

    	const writable_props = ['num', 'length'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Number> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('num' in $$props) $$invalidate(1, num = $$props.num);
    		if ('length' in $$props) $$invalidate(2, length = $$props.length);
    	};

    	$$self.$capture_state = () => ({ beforeUpdate, num, length, getNums, nums });

    	$$self.$inject_state = $$props => {
    		if ('num' in $$props) $$invalidate(1, num = $$props.num);
    		if ('length' in $$props) $$invalidate(2, length = $$props.length);
    		if ('getNums' in $$props) $$invalidate(0, getNums = $$props.getNums);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [getNums, num, length, nums];
    }

    class Number$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { num: 1, length: 2, nums: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Number",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get num() {
    		throw new Error("<Number>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set num(value) {
    		throw new Error("<Number>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get length() {
    		throw new Error("<Number>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set length(value) {
    		throw new Error("<Number>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nums() {
    		return this.$$.ctx[3];
    	}

    	set nums(value) {
    		throw new Error("<Number>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\point\point.svelte generated by Svelte v3.42.2 */
    const file$b = "src\\components\\point\\point.svelte";

    // (38:0) {#if labelAndPoints}
    function create_if_block$4(ctx) {
    	let div;
    	let p;
    	let t0_value = /*labelAndPoints*/ ctx[0].label + "";
    	let t0;
    	let t1;
    	let tnumber;
    	let current;

    	tnumber = new Number$1({
    			props: { num: /*labelAndPoints*/ ctx[0].points },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			create_component(tnumber.$$.fragment);
    			add_location(p, file$b, 39, 4, 1223);
    			add_location(div, file$b, 38, 2, 1212);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(div, t1);
    			mount_component(tnumber, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*labelAndPoints*/ 1) && t0_value !== (t0_value = /*labelAndPoints*/ ctx[0].label + "")) set_data_dev(t0, t0_value);
    			const tnumber_changes = {};
    			if (dirty & /*labelAndPoints*/ 1) tnumber_changes.num = /*labelAndPoints*/ ctx[0].points;
    			tnumber.$set(tnumber_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tnumber.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tnumber.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(tnumber);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(38:0) {#if labelAndPoints}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*labelAndPoints*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty$2();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*labelAndPoints*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*labelAndPoints*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const REFRESH_LABEL_INTERVAL = 3000;

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Point', slots, []);

    	class LabelAndNumber {
    		constructor(label, points) {
    			this.label = label;
    			this.points = points;
    		}
    	}

    	let labelAndPoints$;
    	let labelAndPoints;

    	function renderLabelAndPoints() {
    		labelAndPoints$ = hasCurrent$.pipe(switchMap(hasCurrent => {
    			if (hasCurrent) {
    				return of(new LabelAndNumber("Score", raw().points));
    			}

    			return timer(0, REFRESH_LABEL_INTERVAL).pipe(map(val => {
    				const isOdd = val % 2 === 0;
    				const { points, max } = raw();

    				return isOdd
    				? new LabelAndNumber("Score", points)
    				: new LabelAndNumber("Max ", max);
    			}));
    		})).subscribe(val => {
    			$$invalidate(0, labelAndPoints = val);
    		});
    	}

    	onMount(() => {
    		renderLabelAndPoints();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Point> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		LabelAndNumber,
    		of,
    		Subscription,
    		timer,
    		map,
    		switchMap,
    		onMount,
    		_tetrisQuery,
    		Tnumber: Number$1,
    		labelAndPoints$,
    		labelAndPoints,
    		REFRESH_LABEL_INTERVAL,
    		renderLabelAndPoints
    	});

    	$$self.$inject_state = $$props => {
    		if ('labelAndPoints$' in $$props) labelAndPoints$ = $$props.labelAndPoints$;
    		if ('labelAndPoints' in $$props) $$invalidate(0, labelAndPoints = $$props.labelAndPoints);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [labelAndPoints];
    }

    class Point extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Point",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\components\start-line\start-line.svelte generated by Svelte v3.42.2 */
    const file$a = "src\\components\\start-line\\start-line.svelte";

    // (21:2) {:else}
    function create_else_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Start Line");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(21:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (19:2) {#if hasCurrent}
    function create_if_block_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Lines";
    			add_location(span, file$a, 19, 4, 592);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(19:2) {#if hasCurrent}",
    		ctx
    	});

    	return block;
    }

    // (27:0) {:else}
    function create_else_block$1(ctx) {
    	let tnumber;
    	let current;

    	tnumber = new Number$1({
    			props: { num: /*initLine*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tnumber.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tnumber, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tnumber_changes = {};
    			if (dirty & /*initLine*/ 4) tnumber_changes.num = /*initLine*/ ctx[2];
    			tnumber.$set(tnumber_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tnumber.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tnumber.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tnumber, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(27:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (25:0) {#if hasCurrent}
    function create_if_block$3(ctx) {
    	let tnumber;
    	let current;

    	tnumber = new Number$1({
    			props: { num: /*clearedLines*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tnumber.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tnumber, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tnumber_changes = {};
    			if (dirty & /*clearedLines*/ 2) tnumber_changes.num = /*clearedLines*/ ctx[1];
    			tnumber.$set(tnumber_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tnumber.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tnumber.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tnumber, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(25:0) {#if hasCurrent}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let p;
    	let t;
    	let current_block_type_index;
    	let if_block1;
    	let if_block1_anchor;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*hasCurrent*/ ctx[0]) return create_if_block_1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	const if_block_creators = [create_if_block$3, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*hasCurrent*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			p = element("p");
    			if_block0.c();
    			t = space();
    			if_block1.c();
    			if_block1_anchor = empty$2();
    			add_location(p, file$a, 17, 0, 563);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			if_block0.m(p, null);
    			insert_dev(target, t, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(p, null);
    				}
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if_block0.d();
    			if (detaching) detach_dev(t);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Start_line', slots, []);
    	
    	let hasCurrent$$1;
    	let clearedLines$$1;
    	let initLine$$1;
    	let hasCurrent;
    	let clearedLines;
    	let initLine;

    	onMount(() => {
    		hasCurrent$$1 = hasCurrent$.subscribe(hC => $$invalidate(0, hasCurrent = hC));
    		clearedLines$$1 = clearedLines$.subscribe(cL => $$invalidate(1, clearedLines = cL));
    		initLine$$1 = initLine$.subscribe(iL => $$invalidate(2, initLine = iL));
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Start_line> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		_tetrisQuery,
    		Tnumber: Number$1,
    		hasCurrent$: hasCurrent$$1,
    		clearedLines$: clearedLines$$1,
    		initLine$: initLine$$1,
    		hasCurrent,
    		clearedLines,
    		initLine
    	});

    	$$self.$inject_state = $$props => {
    		if ('hasCurrent$' in $$props) hasCurrent$$1 = $$props.hasCurrent$;
    		if ('clearedLines$' in $$props) clearedLines$$1 = $$props.clearedLines$;
    		if ('initLine$' in $$props) initLine$$1 = $$props.initLine$;
    		if ('hasCurrent' in $$props) $$invalidate(0, hasCurrent = $$props.hasCurrent);
    		if ('clearedLines' in $$props) $$invalidate(1, clearedLines = $$props.clearedLines);
    		if ('initLine' in $$props) $$invalidate(2, initLine = $$props.initLine);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [hasCurrent, clearedLines, initLine];
    }

    class Start_line extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Start_line",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\components\level\level.svelte generated by Svelte v3.42.2 */
    const file$9 = "src\\components\\level\\level.svelte";

    // (27:0) {:else}
    function create_else_block(ctx) {
    	let tnumber;
    	let current;

    	tnumber = new Number$1({
    			props: { num: /*initSpeed*/ ctx[1], length: 1 },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tnumber.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tnumber, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tnumber_changes = {};
    			if (dirty & /*initSpeed*/ 2) tnumber_changes.num = /*initSpeed*/ ctx[1];
    			tnumber.$set(tnumber_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tnumber.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tnumber.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tnumber, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(27:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (25:0) {#if hasCurrent}
    function create_if_block$2(ctx) {
    	let tnumber;
    	let current;

    	tnumber = new Number$1({
    			props: { num: /*speed*/ ctx[0], length: 1 },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tnumber.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tnumber, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tnumber_changes = {};
    			if (dirty & /*speed*/ 1) tnumber_changes.num = /*speed*/ ctx[0];
    			tnumber.$set(tnumber_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tnumber.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tnumber.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tnumber, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(25:0) {#if hasCurrent}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let p;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*hasCurrent*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Level";
    			t1 = space();
    			if_block.c();
    			if_block_anchor = empty$2();
    			add_location(p, file$9, 23, 0, 659);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Level', slots, []);
    	
    	
    	let speed$$1;
    	let initSpeed$$1;
    	let hasCurrent$$1;
    	let speed;
    	let initSpeed;
    	let hasCurrent;

    	onMount(() => {
    		speed$$1 = speed$.subscribe(s => $$invalidate(0, speed = s));
    		initSpeed$$1 = initSpeed$.subscribe(iS => $$invalidate(1, initSpeed = iS));
    		hasCurrent$$1 = hasCurrent$.subscribe(hC => $$invalidate(2, hasCurrent = hC));
    	});

    	onDestroy(() => {
    		speed$$1.unsubscribe();
    		initSpeed$$1.unsubscribe();
    		hasCurrent$$1.unsubscribe();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Level> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onDestroy,
    		onMount,
    		_tetrisQuery,
    		Tnumber: Number$1,
    		speed$: speed$$1,
    		initSpeed$: initSpeed$$1,
    		hasCurrent$: hasCurrent$$1,
    		speed,
    		initSpeed,
    		hasCurrent
    	});

    	$$self.$inject_state = $$props => {
    		if ('speed$' in $$props) speed$$1 = $$props.speed$;
    		if ('initSpeed$' in $$props) initSpeed$$1 = $$props.initSpeed$;
    		if ('hasCurrent$' in $$props) hasCurrent$$1 = $$props.hasCurrent$;
    		if ('speed' in $$props) $$invalidate(0, speed = $$props.speed);
    		if ('initSpeed' in $$props) $$invalidate(1, initSpeed = $$props.initSpeed);
    		if ('hasCurrent' in $$props) $$invalidate(2, hasCurrent = $$props.hasCurrent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [speed, initSpeed, hasCurrent];
    }

    class Level extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Level",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src\components\next\next.svelte generated by Svelte v3.42.2 */
    const file$8 = "src\\components\\next\\next.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (25:6) {#each next as tile}
    function create_each_block_1(ctx) {
    	let ttile;
    	let current;

    	ttile = new Tile({
    			props: { tile: /*tile*/ ctx[5] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ttile.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ttile, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ttile_changes = {};
    			if (dirty & /*nexts*/ 1) ttile_changes.tile = /*tile*/ ctx[5];
    			ttile.$set(ttile_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ttile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ttile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ttile, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(25:6) {#each next as tile}",
    		ctx
    	});

    	return block;
    }

    // (23:2) {#each nexts as next}
    function create_each_block$2(ctx) {
    	let div;
    	let t;
    	let current;
    	let each_value_1 = /*next*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "row svelte-zzeyfs");
    			add_location(div, file$8, 23, 4, 668);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*nexts*/ 1) {
    				each_value_1 = /*next*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, t);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(23:2) {#each nexts as next}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let p;
    	let t1;
    	let div;
    	let current;
    	let each_value = /*nexts*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Next";
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(p, file$8, 20, 0, 606);
    			attr_dev(div, "class", "next svelte-zzeyfs");
    			add_location(div, file$8, 21, 0, 619);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*nexts*/ 1) {
    				each_value = /*nexts*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Next', slots, []);
    	
    	
    	let next$$1;
    	let nexts = [];

    	onMount(() => {
    		next$$1 = next$.pipe(map(piece => piece.next.map(row => row.map(value => new Tile$1(value))))).subscribe(value => $$invalidate(0, nexts = value));
    	});

    	onDestroy(() => {
    		next$$1.unsubscribe();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Next> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		map,
    		onMount,
    		onDestroy,
    		Tile: Tile$1,
    		_tetrisQuery,
    		Ttile: Tile,
    		next$: next$$1,
    		nexts
    	});

    	$$self.$inject_state = $$props => {
    		if ('next$' in $$props) next$$1 = $$props.next$;
    		if ('nexts' in $$props) $$invalidate(0, nexts = $$props.nexts);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [nexts];
    }

    class Next extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Next",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\components\sound\sound.svelte generated by Svelte v3.42.2 */
    const file$7 = "src\\components\\sound\\sound.svelte";

    function create_fragment$b(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "bg music svelte-1tdw0aj");
    			toggle_class(div, "filled", /*muted*/ ctx[0]);
    			add_location(div, file$7, 14, 0, 397);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*muted*/ 1) {
    				toggle_class(div, "filled", /*muted*/ ctx[0]);
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sound', slots, []);
    	
    	let muted$;
    	let muted;

    	onMount(() => {
    		muted$ = sound$$1.pipe(map(sound => !sound)).subscribe(val => $$invalidate(0, muted = val));
    	});

    	onDestroy(() => muted$.unsubscribe());
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Sound> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		map,
    		onDestroy,
    		onMount,
    		_tetrisQuery,
    		muted$,
    		muted
    	});

    	$$self.$inject_state = $$props => {
    		if ('muted$' in $$props) muted$ = $$props.muted$;
    		if ('muted' in $$props) $$invalidate(0, muted = $$props.muted);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [muted];
    }

    class Sound extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sound",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\components\pause\pause.svelte generated by Svelte v3.42.2 */
    const file$6 = "src\\components\\pause\\pause.svelte";

    function create_fragment$a(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "bg pause svelte-2b203i");
    			toggle_class(div, "filled", /*paused*/ ctx[0]);
    			add_location(div, file$6, 20, 0, 687);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*paused*/ 1) {
    				toggle_class(div, "filled", /*paused*/ ctx[0]);
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Pause', slots, []);
    	let paused$;
    	let paused;

    	onMount(() => {
    		paused$ = gameState$.pipe(switchMap(state => {
    			if (state === GameState.Paused) {
    				return interval(250).pipe(map(num => !!(num % 2)));
    			}

    			return of(false);
    		})).subscribe(val => $$invalidate(0, paused = val));
    	});

    	onDestroy(() => paused$.unsubscribe());
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Pause> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		interval,
    		of,
    		Subscription,
    		map,
    		switchMap,
    		onDestroy,
    		onMount,
    		GameState,
    		_tetrisQuery,
    		paused$,
    		paused
    	});

    	$$self.$inject_state = $$props => {
    		if ('paused$' in $$props) paused$ = $$props.paused$;
    		if ('paused' in $$props) $$invalidate(0, paused = $$props.paused);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [paused];
    }

    class Pause extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pause",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\components\clock\clock.svelte generated by Svelte v3.42.2 */
    const file$5 = "src\\components\\clock\\clock.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (29:2) {#each clock as item}
    function create_each_block$1(ctx) {
    	let span;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", span_class_value = "bg num num-" + /*item*/ ctx[2] + " svelte-tsmjly");
    			add_location(span, file$5, 29, 4, 902);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*clock*/ 1 && span_class_value !== (span_class_value = "bg num num-" + /*item*/ ctx[2] + " svelte-tsmjly")) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(29:2) {#each clock as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let each_value = /*clock*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "number svelte-tsmjly");
    			add_location(div, file$5, 27, 0, 851);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*clock*/ 1) {
    				each_value = /*clock*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const REFRESH_CLOCK_INTERVAL = 1000;

    function renderClock() {
    	const now = new Date();
    	const hours = formatTwoDigits(now.getHours());
    	const minutes = formatTwoDigits(now.getMinutes());
    	const isOddSecond = now.getSeconds() % 2 !== 0;
    	const blinking = `colon-${isOddSecond ? "solid" : "faded"}`;
    	return [...hours, blinking, ...minutes];
    }

    function formatTwoDigits(num) {
    	return `${num}`.padStart(2, "0").split("");
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Clock', slots, []);
    	let clock$;
    	let clock = [];

    	onMount(() => {
    		clock$ = timer(0, REFRESH_CLOCK_INTERVAL).pipe(map(() => renderClock())).subscribe(val => $$invalidate(0, clock = val));
    	});

    	onDestroy(() => {
    		clock$.unsubscribe();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Clock> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Subscription,
    		timer,
    		map,
    		onDestroy,
    		onMount,
    		REFRESH_CLOCK_INTERVAL,
    		clock$,
    		clock,
    		renderClock,
    		formatTwoDigits
    	});

    	$$self.$inject_state = $$props => {
    		if ('clock$' in $$props) clock$ = $$props.clock$;
    		if ('clock' in $$props) $$invalidate(0, clock = $$props.clock);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [clock];
    }

    class Clock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Clock",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\state\keyboard\keyboard.store.svelte generated by Svelte v3.42.2 */

    const createInitialState = () => ({
    	up: false,
    	down: false,
    	left: false,
    	right: false,
    	pause: false,
    	sound: false,
    	reset: false,
    	drop: false
    });

    const KeyboardStore = createEntityStore(createInitialState(), { name: "SvelteTetrisKeyboard" });

    /* src\state\keyboard\keyboard.query.svelte generated by Svelte v3.42.2 */

    function create_fragment$8(ctx) {
    	const block = {
    		c: noop$1,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop$1,
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: noop$1
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }


    const KeyboardQuery = createEntityQuery(KeyboardStore);
    const up$ = KeyboardQuery.select("up");
    const down$ = KeyboardQuery.select("down");
    const left$ = KeyboardQuery.select("left");
    const right$ = KeyboardQuery.select("right");
    const drop$ = KeyboardQuery.select("drop");
    const pause$ = KeyboardQuery.select("pause");
    const sound$ = KeyboardQuery.select("sound");
    const reset$ = KeyboardQuery.select("reset");

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Keyboard_query', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Keyboard_query> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		createEntityQuery,
    		QueryEntity,
    		KeyboardStore,
    		KeyboardQuery,
    		up$,
    		down$,
    		left$,
    		right$,
    		drop$,
    		pause$,
    		sound$,
    		reset$
    	});

    	return [];
    }

    class Keyboard_query extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard_query",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    var _keyboardQuery = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Keyboard_query,
        KeyboardQuery: KeyboardQuery,
        up$: up$,
        down$: down$,
        left$: left$,
        right$: right$,
        drop$: drop$,
        pause$: pause$,
        sound$: sound$,
        reset$: reset$
    });

    /* src\interfaces\arrow-button.svelte generated by Svelte v3.42.2 */

    var ArrowButton;

    (function (ArrowButton) {
    	ArrowButton["UP"] = "UP";
    	ArrowButton["DOWN"] = "DOWN";
    	ArrowButton["LEFT"] = "LEFT";
    	ArrowButton["RIGHT"] = "RIGHT";
    })(ArrowButton || (ArrowButton = {}));

    const ArrowButtonTransform = {
    	[ArrowButton.UP]: "translate(0px, 63px) scale(1, 2)",
    	[ArrowButton.DOWN]: "translate(0,-71px) rotate(180deg) scale(1, 2)",
    	[ArrowButton.LEFT]: "translate(60px, -12px) rotate(270deg) scale(1, 2)",
    	[ArrowButton.RIGHT]: "translate(-60px, -12px) rotate(90deg) scale(1, 2)"
    };

    /* src\components\button\button.svelte generated by Svelte v3.42.2 */
    const file$4 = "src\\components\\button\\button.svelte";

    // (48:2) {#if arrowButton}
    function create_if_block$1(ctx) {
    	let em;

    	const block = {
    		c: function create() {
    			em = element("em");
    			set_style(em, "transform", /*arrowTransforms*/ ctx[7]());
    			attr_dev(em, "class", "svelte-qhatfd");
    			add_location(em, file$4, 48, 4, 1073);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, em, anchor);
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(em);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(48:2) {#if arrowButton}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let i;
    	let t0;
    	let t1;
    	let span;
    	let t2;
    	let div_class_value;
    	let mounted;
    	let dispose;
    	let if_block = /*arrowButton*/ ctx[4] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			span = element("span");
    			t2 = text(/*content*/ ctx[5]);
    			attr_dev(i, "class", "svelte-qhatfd");
    			toggle_class(i, "active", /*active*/ ctx[6]);
    			add_location(i, file$4, 46, 2, 1028);
    			attr_dev(span, "class", "svelte-qhatfd");
    			toggle_class(span, "absolute", /*isAbsolute*/ ctx[1]);
    			add_location(span, file$4, 51, 2, 1134);
    			attr_dev(div, "class", div_class_value = "button " + /*className*/ ctx[0] + " svelte-qhatfd");
    			set_style(div, "top", /*top*/ ctx[2] + "px");
    			set_style(div, "left", /*left*/ ctx[3] + "px");
    			add_location(div, file$4, 38, 0, 840);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, i);
    			append_dev(div, t0);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t1);
    			append_dev(div, span);
    			append_dev(span, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mousedown", /*mouseDown*/ ctx[8], false, false, false),
    					listen_dev(div, "mouseup", /*mouseUp*/ ctx[9], false, false, false),
    					listen_dev(div, "touchstart", /*mouseDown*/ ctx[8], { passive: true }, false, false),
    					listen_dev(div, "touchend", /*mouseUp*/ ctx[9], { passive: true }, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*active*/ 64) {
    				toggle_class(i, "active", /*active*/ ctx[6]);
    			}

    			if (/*arrowButton*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*content*/ 32) set_data_dev(t2, /*content*/ ctx[5]);

    			if (dirty & /*isAbsolute*/ 2) {
    				toggle_class(span, "absolute", /*isAbsolute*/ ctx[1]);
    			}

    			if (dirty & /*className*/ 1 && div_class_value !== (div_class_value = "button " + /*className*/ ctx[0] + " svelte-qhatfd")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*top*/ 4) {
    				set_style(div, "top", /*top*/ ctx[2] + "px");
    			}

    			if (dirty & /*left*/ 8) {
    				set_style(div, "left", /*left*/ ctx[3] + "px");
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, []);
    	
    	
    	let { className = "" } = $$props;
    	let { isAbsolute = false } = $$props;
    	let { top } = $$props;
    	let { left } = $$props;
    	let { active$ } = $$props;
    	let active;
    	let { arrowButton } = $$props;
    	let { content } = $$props;
    	let { key } = $$props;

    	onMount(() => {
    		
    	});

    	active$.subscribe(val => {
    		$$invalidate(6, active = val);
    	});

    	beforeUpdate(() => {
    		active$.subscribe(val => {
    			$$invalidate(6, active = val);
    		});
    	});

    	function arrowTransforms() {
    		return ArrowButtonTransform[arrowButton];
    	}

    	const dispatch = createEventDispatcher();

    	function mouseDown() {
    		dispatch("mousekeydown", { key });
    	}

    	function mouseUp() {
    		dispatch("mousekeyup", { key });
    	}

    	const writable_props = [
    		'className',
    		'isAbsolute',
    		'top',
    		'left',
    		'active$',
    		'arrowButton',
    		'content',
    		'key'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('className' in $$props) $$invalidate(0, className = $$props.className);
    		if ('isAbsolute' in $$props) $$invalidate(1, isAbsolute = $$props.isAbsolute);
    		if ('top' in $$props) $$invalidate(2, top = $$props.top);
    		if ('left' in $$props) $$invalidate(3, left = $$props.left);
    		if ('active$' in $$props) $$invalidate(10, active$ = $$props.active$);
    		if ('arrowButton' in $$props) $$invalidate(4, arrowButton = $$props.arrowButton);
    		if ('content' in $$props) $$invalidate(5, content = $$props.content);
    		if ('key' in $$props) $$invalidate(11, key = $$props.key);
    	};

    	$$self.$capture_state = () => ({
    		ArrowButtonTransform,
    		beforeUpdate,
    		createEventDispatcher,
    		onMount,
    		className,
    		isAbsolute,
    		top,
    		left,
    		active$,
    		active,
    		arrowButton,
    		content,
    		key,
    		arrowTransforms,
    		dispatch,
    		mouseDown,
    		mouseUp
    	});

    	$$self.$inject_state = $$props => {
    		if ('className' in $$props) $$invalidate(0, className = $$props.className);
    		if ('isAbsolute' in $$props) $$invalidate(1, isAbsolute = $$props.isAbsolute);
    		if ('top' in $$props) $$invalidate(2, top = $$props.top);
    		if ('left' in $$props) $$invalidate(3, left = $$props.left);
    		if ('active$' in $$props) $$invalidate(10, active$ = $$props.active$);
    		if ('active' in $$props) $$invalidate(6, active = $$props.active);
    		if ('arrowButton' in $$props) $$invalidate(4, arrowButton = $$props.arrowButton);
    		if ('content' in $$props) $$invalidate(5, content = $$props.content);
    		if ('key' in $$props) $$invalidate(11, key = $$props.key);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		className,
    		isAbsolute,
    		top,
    		left,
    		arrowButton,
    		content,
    		active,
    		arrowTransforms,
    		mouseDown,
    		mouseUp,
    		active$,
    		key
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			className: 0,
    			isAbsolute: 1,
    			top: 2,
    			left: 3,
    			active$: 10,
    			arrowButton: 4,
    			content: 5,
    			key: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*top*/ ctx[2] === undefined && !('top' in props)) {
    			console.warn("<Button> was created without expected prop 'top'");
    		}

    		if (/*left*/ ctx[3] === undefined && !('left' in props)) {
    			console.warn("<Button> was created without expected prop 'left'");
    		}

    		if (/*active$*/ ctx[10] === undefined && !('active$' in props)) {
    			console.warn("<Button> was created without expected prop 'active$'");
    		}

    		if (/*arrowButton*/ ctx[4] === undefined && !('arrowButton' in props)) {
    			console.warn("<Button> was created without expected prop 'arrowButton'");
    		}

    		if (/*content*/ ctx[5] === undefined && !('content' in props)) {
    			console.warn("<Button> was created without expected prop 'content'");
    		}

    		if (/*key*/ ctx[11] === undefined && !('key' in props)) {
    			console.warn("<Button> was created without expected prop 'key'");
    		}
    	}

    	get className() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set className(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isAbsolute() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isAbsolute(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get top() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get left() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set left(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active$() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active$(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get arrowButton() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set arrowButton(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get content() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get key() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\keyboard\keyboard.svelte generated by Svelte v3.42.2 */
    const file$3 = "src\\components\\keyboard\\keyboard.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let tbutton0;
    	let t0;
    	let tbutton1;
    	let t1;
    	let tbutton2;
    	let t2;
    	let tbutton3;
    	let t3;
    	let tbutton4;
    	let t4;
    	let tbutton5;
    	let t5;
    	let tbutton6;
    	let t6;
    	let tbutton7;
    	let current;

    	tbutton0 = new Button({
    			props: {
    				className: "blue btn-md",
    				content: "Rotation",
    				active$: up$,
    				arrowButton: ArrowButton.UP,
    				top: 0,
    				left: 100,
    				isAbsolute: true,
    				key: "Up"
    			},
    			$$inline: true
    		});

    	tbutton0.$on("mousekeydown", /*mouseDown*/ ctx[1]);
    	tbutton0.$on("mousekeyup", /*mouseUp*/ ctx[2]);

    	tbutton1 = new Button({
    			props: {
    				className: "blue btn-md",
    				content: "Down",
    				active$: down$,
    				arrowButton: ArrowButton.DOWN,
    				top: 180,
    				left: 100,
    				key: "Down"
    			},
    			$$inline: true
    		});

    	tbutton1.$on("mousekeydown", /*mouseDown*/ ctx[1]);
    	tbutton1.$on("mousekeyup", /*mouseUp*/ ctx[2]);

    	tbutton2 = new Button({
    			props: {
    				className: "blue btn-md",
    				content: "Left",
    				active$: left$,
    				arrowButton: ArrowButton.LEFT,
    				top: 90,
    				left: 10,
    				key: "Left"
    			},
    			$$inline: true
    		});

    	tbutton2.$on("mousekeydown", /*mouseDown*/ ctx[1]);
    	tbutton2.$on("mousekeyup", /*mouseUp*/ ctx[2]);

    	tbutton3 = new Button({
    			props: {
    				className: "blue btn-md",
    				content: "Right",
    				active$: right$,
    				arrowButton: ArrowButton.RIGHT,
    				top: 90,
    				left: 190,
    				key: "Right"
    			},
    			$$inline: true
    		});

    	tbutton3.$on("mousekeydown", /*mouseDown*/ ctx[1]);
    	tbutton3.$on("mousekeyup", /*mouseUp*/ ctx[2]);

    	tbutton4 = new Button({
    			props: {
    				className: "blue btn-lg",
    				content: "Drop (SPACE)",
    				active$: drop$,
    				top: 100,
    				left: 374,
    				key: "Space"
    			},
    			$$inline: true
    		});

    	tbutton4.$on("mousekeydown", /*mouseDown*/ ctx[1]);
    	tbutton4.$on("mousekeyup", /*mouseUp*/ ctx[2]);

    	tbutton5 = new Button({
    			props: {
    				className: "red btn-sm",
    				content: "Reset (R)",
    				active$: reset$,
    				top: 0,
    				left: 480,
    				key: "Reset"
    			},
    			$$inline: true
    		});

    	tbutton5.$on("mousekeydown", /*mouseDown*/ ctx[1]);
    	tbutton5.$on("mousekeyup", /*mouseUp*/ ctx[2]);

    	tbutton6 = new Button({
    			props: {
    				className: "green btn-sm",
    				content: "Sound (S)",
    				active$: sound$,
    				top: 0,
    				left: 390,
    				key: "Sound"
    			},
    			$$inline: true
    		});

    	tbutton6.$on("mousekeydown", /*mouseDown*/ ctx[1]);
    	tbutton6.$on("mousekeyup", /*mouseUp*/ ctx[2]);

    	tbutton7 = new Button({
    			props: {
    				className: "green btn-sm",
    				content: "Pause (P)",
    				active$: pause$,
    				top: 0,
    				left: 300,
    				key: "Pause"
    			},
    			$$inline: true
    		});

    	tbutton7.$on("mousekeydown", /*mouseDown*/ ctx[1]);
    	tbutton7.$on("mousekeyup", /*mouseUp*/ ctx[2]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(tbutton0.$$.fragment);
    			t0 = space();
    			create_component(tbutton1.$$.fragment);
    			t1 = space();
    			create_component(tbutton2.$$.fragment);
    			t2 = space();
    			create_component(tbutton3.$$.fragment);
    			t3 = space();
    			create_component(tbutton4.$$.fragment);
    			t4 = space();
    			create_component(tbutton5.$$.fragment);
    			t5 = space();
    			create_component(tbutton6.$$.fragment);
    			t6 = space();
    			create_component(tbutton7.$$.fragment);
    			attr_dev(div, "class", "keyboard svelte-147dxtc");
    			set_style(div, "margin-top", /*filling*/ ctx[0] + "px");
    			add_location(div, file$3, 21, 0, 629);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(tbutton0, div, null);
    			append_dev(div, t0);
    			mount_component(tbutton1, div, null);
    			append_dev(div, t1);
    			mount_component(tbutton2, div, null);
    			append_dev(div, t2);
    			mount_component(tbutton3, div, null);
    			append_dev(div, t3);
    			mount_component(tbutton4, div, null);
    			append_dev(div, t4);
    			mount_component(tbutton5, div, null);
    			append_dev(div, t5);
    			mount_component(tbutton6, div, null);
    			append_dev(div, t6);
    			mount_component(tbutton7, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*filling*/ 1) {
    				set_style(div, "margin-top", /*filling*/ ctx[0] + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tbutton0.$$.fragment, local);
    			transition_in(tbutton1.$$.fragment, local);
    			transition_in(tbutton2.$$.fragment, local);
    			transition_in(tbutton3.$$.fragment, local);
    			transition_in(tbutton4.$$.fragment, local);
    			transition_in(tbutton5.$$.fragment, local);
    			transition_in(tbutton6.$$.fragment, local);
    			transition_in(tbutton7.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tbutton0.$$.fragment, local);
    			transition_out(tbutton1.$$.fragment, local);
    			transition_out(tbutton2.$$.fragment, local);
    			transition_out(tbutton3.$$.fragment, local);
    			transition_out(tbutton4.$$.fragment, local);
    			transition_out(tbutton5.$$.fragment, local);
    			transition_out(tbutton6.$$.fragment, local);
    			transition_out(tbutton7.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(tbutton0);
    			destroy_component(tbutton1);
    			destroy_component(tbutton2);
    			destroy_component(tbutton3);
    			destroy_component(tbutton4);
    			destroy_component(tbutton5);
    			destroy_component(tbutton6);
    			destroy_component(tbutton7);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Keyboard', slots, []);
    	const dispatch = createEventDispatcher();
    	let { filling = 20 } = $$props;

    	function mouseDown(event) {
    		event.preventDefault();
    		dispatch("mousekeydown", { key: event.detail.key });
    	}

    	function mouseUp(event) {
    		event.preventDefault();
    		dispatch("mousekeyup", { key: event.detail.key });
    	}

    	const writable_props = ['filling'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Keyboard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('filling' in $$props) $$invalidate(0, filling = $$props.filling);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		of,
    		_query: _keyboardQuery,
    		ArrowButton,
    		TButton: Button,
    		dispatch,
    		filling,
    		mouseDown,
    		mouseUp
    	});

    	$$self.$inject_state = $$props => {
    		if ('filling' in $$props) $$invalidate(0, filling = $$props.filling);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [filling, mouseDown, mouseUp];
    }

    class Keyboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { filling: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get filling() {
    		throw new Error("<Keyboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filling(value) {
    		throw new Error("<Keyboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\matrix\matrix.svelte generated by Svelte v3.42.2 */

    const { console: console_1 } = globals;
    const file$2 = "src\\components\\matrix\\matrix.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (44:2) {#each matrixValue as tile}
    function create_each_block(ctx) {
    	let ttile;
    	let current;

    	ttile = new Tile({
    			props: { tile: /*tile*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(ttile.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ttile, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ttile_changes = {};
    			if (dirty & /*matrixValue*/ 1) ttile_changes.tile = /*tile*/ ctx[3];
    			ttile.$set(ttile_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ttile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ttile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ttile, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(44:2) {#each matrixValue as tile}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let current;
    	let each_value = /*matrixValue*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "matrix svelte-1i6o7og");
    			add_location(div, file$2, 42, 0, 1801);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*matrixValue*/ 1) {
    				each_value = /*matrixValue*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Matrix', slots, []);
    	
    	let matrix$$1;
    	let matrixValue = [];

    	function getMatrix() {
    		return combineLatest([gameState$, matrix$]).pipe(switchMap(([gameState, matrix]) => {
    			if (gameState !== GameState.Over && gameState !== GameState.Loading) {
    				return of(matrix);
    			}

    			const newMatrix = [...matrix];
    			const rowsLength = MatrixUtil.Height * 2;

    			const animatedMatrix$ = timer(0, rowsLength).pipe(map(x => x + 1), takeWhile(x => x <= rowsLength + 1), switchMap(idx => {
    				const gridIndex = idx - 1;

    				if (gridIndex < MatrixUtil.Height) {
    					newMatrix.splice(gridIndex * MatrixUtil.Width, MatrixUtil.Width, ...MatrixUtil.FullRow);
    				}

    				if (gridIndex > MatrixUtil.Height && gridIndex <= rowsLength) {
    					const startIdx = (MatrixUtil.Height - (gridIndex - MatrixUtil.Height)) * MatrixUtil.Width;
    					newMatrix.splice(startIdx, MatrixUtil.Width, ...MatrixUtil.EmptyRow);
    				}

    				return of(newMatrix);
    			}));

    			return animatedMatrix$;
    		}));
    	}

    	onMount(() => {
    		matrix$$1 = getMatrix().subscribe(tiles => $$invalidate(0, matrixValue = tiles));
    	});

    	onDestroy(() => {
    		console.log("destroy");
    		matrix$$1.unsubscribe();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Matrix> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Ttile: Tile,
    		TetrisQuery: _tetrisQuery,
    		combineLatest,
    		Observable,
    		of,
    		timer,
    		Subscription,
    		map,
    		switchMap,
    		takeWhile,
    		GameState,
    		MatrixUtil,
    		onMount,
    		onDestroy,
    		matrix$: matrix$$1,
    		matrixValue,
    		getMatrix
    	});

    	$$self.$inject_state = $$props => {
    		if ('matrix$' in $$props) matrix$$1 = $$props.matrix$;
    		if ('matrixValue' in $$props) $$invalidate(0, matrixValue = $$props.matrixValue);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [matrixValue];
    }

    class Matrix extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Matrix",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\services\sound-manager.service.svelte generated by Svelte v3.42.2 */

    function create_fragment$4(ctx) {
    	const block = {
    		c: noop$1,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop$1,
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: noop$1
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const SOUND_FILE_PATH = "/assets/tetris-sound.mp3";
    let _context;
    let _buffer;

    function start$1() {
    	_playMusic(0, 3.7202, 3.6224);
    }

    function clear() {
    	_playMusic(0, 0, 0.7675);
    }

    function fall() {
    	_playMusic(0, 1.2558, 0.3546);
    }

    function gameOver() {
    	_playMusic(0, 8.1276, 1.1437);
    }

    function rotate$1() {
    	_playMusic(0, 2.2471, 0.0807);
    }

    function move() {
    	_playMusic(0, 2.9088, 0.1437);
    }

    function _playMusic(when, offset, duration) {
    	if (!isEnableSound()) {
    		return;
    	}

    	_loadSound().then(source => {
    		if (source) {
    			source.start(when, offset, duration);
    		}
    	});
    }

    function _loadSound() {
    	return new Promise((resolve, reject) => {
    			if (_context && _buffer) {
    				resolve(_getSource(_context, _buffer));
    				return;
    			}

    			const context = new AudioContext();
    			const req = new XMLHttpRequest();
    			req.open("GET", SOUND_FILE_PATH, true);
    			req.responseType = "arraybuffer";

    			req.onload = () => {
    				context.decodeAudioData(
    					req.response,
    					buffer => {
    						_context = context;
    						_buffer = buffer;
    						resolve(_getSource(context, buffer));
    					},
    					() => {
    						const msg = "Sorry, cannot play sound. But I hope you still enjoy Svelte Tetris!!!";
    						alert(msg);
    						reject(msg);
    					}
    				);
    			};

    			req.send();
    		});
    }

    function _getSource(context, buffer) {
    	const source = context.createBufferSource();
    	source.buffer = buffer;
    	source.connect(context.destination);
    	return source;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sound_manager_service', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Sound_manager_service> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		_query: TetrisQuery,
    		isEnableSound,
    		SOUND_FILE_PATH,
    		_context,
    		_buffer,
    		start: start$1,
    		clear,
    		fall,
    		gameOver,
    		rotate: rotate$1,
    		move,
    		_playMusic,
    		_loadSound,
    		_getSource
    	});

    	return [];
    }

    class Sound_manager_service extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sound_manager_service",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    var _soundService = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Sound_manager_service,
        start: start$1,
        clear: clear,
        fall: fall,
        gameOver: gameOver,
        rotate: rotate$1,
        move: move,
        _playMusic: _playMusic,
        _loadSound: _loadSound,
        _getSource: _getSource
    });

    /* src\state\keyboard\keyboard.service.svelte generated by Svelte v3.42.2 */

    function create_fragment$3(ctx) {
    	const block = {
    		c: noop$1,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop$1,
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: noop$1
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }



    function setKeỵ(keyState) {
    	KeyboardStore.update(keyState);
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Keyboard_service', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Keyboard_service> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ KeyboardStore, setKeỵ });
    	return [];
    }

    class Keyboard_service extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard_service",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    var _keyboardService = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Keyboard_service,
        setKeỵ: setKeỵ
    });

    /* src\state\tetris\tetris.service.svelte generated by Svelte v3.42.2 */

    const { Object: Object_1 } = globals;

    function create_fragment$2(ctx) {
    	const block = {
    		c: noop$1,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop$1,
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: noop$1
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }





    let _gameInterval;
    const _pieceFactory = new PieceFactory();

    function _locked() {
    	return locked();
    }

    function _current() {
    	return current();
    }

    function _next() {
    	return next();
    }

    function _matrix() {
    	return matrix();
    }

    function start() {
    	if (!_current()) {
    		_setCurrentPiece(_next());
    		_setNext();
    	}

    	const { initLine, initSpeed } = raw();

    	TetrisStore.update({
    		points: 0,
    		gameState: GameState.Started,
    		matrix: MatrixUtil.getStartBoard(initLine),
    		speed: initSpeed
    	});

    	_unsubscribe();
    	auto(MatrixUtil.getSpeedDelay(initSpeed));
    	_setLocked(false);
    }

    function auto(delay) {
    	_gameInterval = timer(0, delay).subscribe(() => {
    		_update();
    	});
    }

    function resume() {
    	if (!isPause()) {
    		return;
    	}

    	const { speed } = raw();

    	TetrisStore.update({
    		locked: false,
    		gameState: GameState.Started
    	});

    	auto(MatrixUtil.getSpeedDelay(speed));
    }

    function pause() {
    	if (!isPlaying()) {
    		return;
    	}

    	TetrisStore.update({
    		locked: true,
    		gameState: GameState.Paused
    	});

    	_unsubscribe();
    }

    function reset() {
    	const { sound } = raw();
    	TetrisStore.update(Object.assign(Object.assign({}, createInitialState$1(_pieceFactory)), { sound }));
    }

    function moveLeft() {
    	if (_locked()) {
    		return;
    	}

    	_clearPiece();
    	_setCurrentPiece(_current().store());
    	_setCurrentPiece(_current().moveLeft());

    	if (_isCollidesLeft()) {
    		_setCurrentPiece(_current().revert());
    	}

    	_drawPiece();
    }

    function moveRight() {
    	if (_locked()) {
    		return;
    	}

    	_clearPiece();
    	_setCurrentPiece(_current().store());
    	_setCurrentPiece(_current().moveRight());

    	if (_isCollidesRight()) {
    		_setCurrentPiece(_current().revert());
    	}

    	_drawPiece();
    }

    function rotate() {
    	if (_locked()) {
    		return;
    	}

    	_clearPiece();
    	_setCurrentPiece(_current().store());
    	_setCurrentPiece(_current().rotate());

    	while (_isCollidesRight()) {
    		_setCurrentPiece(_current().moveLeft());

    		if (_isCollidesLeft()) {
    			_setCurrentPiece(_current().revert());
    			break;
    		}
    	}

    	_drawPiece();
    }

    function moveDown() {
    	_update();
    }

    function drop() {
    	if (_locked()) {
    		return;
    	}

    	while (!_isCollidesBottom()) {
    		_clearPiece();
    		_setCurrentPiece(_current().store());
    		_setCurrentPiece(_current().moveDown());
    	}

    	_setCurrentPiece(_current().revert());
    	_drawPiece();
    }

    function setSound() {
    	const sound = raw().sound;
    	TetrisStore.update({ sound: !sound });
    }

    function decreaseLevel() {
    	const { initSpeed } = raw();
    	const newSpeed = initSpeed - 1 < 1 ? 6 : initSpeed - 1;
    	TetrisStore.update({ initSpeed: newSpeed });
    }

    function increaseLevel() {
    	const { initSpeed } = raw();
    	const newSpeed = initSpeed + 1 > 6 ? 1 : initSpeed + 1;
    	TetrisStore.update({ initSpeed: newSpeed });
    }

    function increaseStartLine() {
    	const { initLine } = raw();
    	const startLine = initLine + 1 > 10 ? 1 : initLine + 1;
    	TetrisStore.update({ initLine: startLine });
    }

    function decreaseStartLine() {
    	const { initLine } = raw();
    	const startLine = initLine - 1 < 1 ? 10 : initLine - 1;
    	TetrisStore.update({ initLine: startLine });
    }

    function _update() {
    	if (_locked()) {
    		return;
    	}

    	_setLocked(true);
    	_setCurrentPiece(_current().revert());
    	_clearPiece();
    	_setCurrentPiece(_current().store());
    	_setCurrentPiece(_current().moveDown());

    	if (_isCollidesBottom()) {
    		_setCurrentPiece(_current().revert());
    		_markAsSolid();
    		_drawPiece();
    		_clearFullLines();
    		_setCurrentPiece(_next());
    		_setNext();

    		if (_isGameOver()) {
    			_onGameOver();
    			return;
    		}
    	}

    	_drawPiece();
    	_setLocked(false);
    }

    function _clearFullLines() {
    	let numberOfClearedLines = 0;
    	const newMatrix = [..._matrix()];

    	for (let row = MatrixUtil.Height - 1; row >= 0; row--) {
    		const pos = row * MatrixUtil.Width;
    		const fullRowTiles = newMatrix.slice(pos, pos + MatrixUtil.Width);
    		const isFullRow = fullRowTiles.every(x => x.isSolid);

    		if (isFullRow) {
    			numberOfClearedLines++;
    			const topPortion = _matrix().slice(0, row * MatrixUtil.Width);
    			newMatrix.splice(0, ++row * MatrixUtil.Width, ...MatrixUtil.EmptyRow.concat(topPortion));
    			_setMatrix(newMatrix);
    		}
    	}

    	_setPointsAndSpeed(numberOfClearedLines);
    }

    function _isGameOver() {
    	_setCurrentPiece(_current().store());
    	_setCurrentPiece(_current().moveDown());

    	if (_isCollidesBottom()) {
    		return true;
    	}

    	_setCurrentPiece(_current().revert());
    	return false;
    }

    function _onGameOver() {
    	pause();
    	gameOver();
    	const { points, max, sound } = raw();
    	const maxPoint = Math.max(points, max);
    	setMaxPoint(maxPoint);

    	TetrisStore.update(Object.assign(Object.assign({}, createInitialState$1(_pieceFactory)), {
    		max: maxPoint,
    		gameState: GameState.Over,
    		sound
    	}));
    }

    function _isCollidesBottom() {
    	if (_current().bottomRow >= MatrixUtil.Height) {
    		return true;
    	}

    	return _collides();
    }

    function _isCollidesLeft() {
    	if (_current().leftCol < 0) {
    		return true;
    	}

    	return _collides();
    }

    function _isCollidesRight() {
    	if (_current().rightCol >= MatrixUtil.Width) {
    		return true;
    	}

    	return _collides();
    }

    function _collides() {
    	return _current().positionOnGrid.some(pos => {
    		if (_matrix()[pos].isSolid) {
    			return true;
    		}

    		return false;
    	});
    }

    function _drawPiece() {
    	_setCurrentPiece(_current().clearStore());

    	_loopThroughPiecePosition(position => {
    		const isSolid = _matrix()[position].isSolid;
    		_updateMatrix(position, new FilledTile(isSolid));
    	});
    }

    function _markAsSolid() {
    	_loopThroughPiecePosition(position => {
    		_updateMatrix(position, new FilledTile(true));
    	});
    }

    function _clearPiece() {
    	_loopThroughPiecePosition(position => {
    		_updateMatrix(position, new EmptyTile());
    	});
    }

    function _loopThroughPiecePosition(callback) {
    	_current().positionOnGrid.forEach(position => {
    		callback(position);
    	});
    }

    function _setPointsAndSpeed(numberOfClearedLines) {
    	if (!numberOfClearedLines) {
    		return;
    	}

    	clear();
    	const { points, clearedLines, speed, initSpeed } = raw();
    	const newLines = clearedLines + numberOfClearedLines;
    	const newPoints = _getPoints(numberOfClearedLines, points);
    	const newSpeed = _getSpeed(newLines, initSpeed);

    	TetrisStore.update({
    		points: newPoints,
    		clearedLines: newLines,
    		speed: newSpeed
    	});

    	if (newSpeed !== speed) {
    		_unsubscribe();
    		auto(MatrixUtil.getSpeedDelay(newSpeed));
    	}
    }

    function _getSpeed(totalLines, initSpeed) {
    	const addedSpeed = Math.floor(totalLines / MatrixUtil.Height);
    	let newSpeed = initSpeed + addedSpeed;
    	newSpeed = newSpeed > 6 ? 6 : newSpeed;
    	return newSpeed;
    }

    function _getPoints(numberOfClearedLines, points) {
    	const addedPoints = MatrixUtil.Points[numberOfClearedLines - 1];
    	const newPoints = points + addedPoints;

    	return newPoints > MatrixUtil.MaxPoint
    	? MatrixUtil.MaxPoint
    	: newPoints;
    }

    function _updateMatrix(pos, tile) {
    	const newMatrix = [..._matrix()];
    	newMatrix[pos] = tile;
    	_setMatrix(newMatrix);
    }

    function _setNext() {
    	TetrisStore.update({ next: _pieceFactory.getRandomPiece() });
    }

    function _setCurrentPiece(piece) {
    	TetrisStore.update({ current: piece });
    }

    function _setMatrix(matrix) {
    	TetrisStore.update({ matrix });
    }

    function _setLocked(locked) {
    	TetrisStore.update({ locked });
    }

    function _unsubscribe() {
    	if (_gameInterval) {
    		_gameInterval.unsubscribe();
    	}
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tetris_service', slots, []);
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tetris_service> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		PieceFactory,
    		GameState,
    		EmptyTile,
    		FilledTile,
    		MatrixUtil,
    		Subscription,
    		timer,
    		_query: _tetrisQuery,
    		_store,
    		_soundManager: _soundService,
    		LocalStorageService,
    		createInitialState: createInitialState$1,
    		_gameInterval,
    		_pieceFactory,
    		_locked,
    		_current,
    		_next,
    		_matrix,
    		start,
    		auto,
    		resume,
    		pause,
    		reset,
    		moveLeft,
    		moveRight,
    		rotate,
    		moveDown,
    		drop,
    		setSound,
    		decreaseLevel,
    		increaseLevel,
    		increaseStartLine,
    		decreaseStartLine,
    		_update,
    		_clearFullLines,
    		_isGameOver,
    		_onGameOver,
    		_isCollidesBottom,
    		_isCollidesLeft,
    		_isCollidesRight,
    		_collides,
    		_drawPiece,
    		_markAsSolid,
    		_clearPiece,
    		_loopThroughPiecePosition,
    		_setPointsAndSpeed,
    		_getSpeed,
    		_getPoints,
    		_updateMatrix,
    		_setNext,
    		_setCurrentPiece,
    		_setMatrix,
    		_setLocked,
    		_unsubscribe
    	});

    	return [];
    }

    class Tetris_service extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tetris_service",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    var _tetrisService = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Tetris_service,
        start: start,
        auto: auto,
        resume: resume,
        pause: pause,
        reset: reset,
        moveLeft: moveLeft,
        moveRight: moveRight,
        rotate: rotate,
        moveDown: moveDown,
        drop: drop,
        setSound: setSound,
        decreaseLevel: decreaseLevel,
        increaseLevel: increaseLevel,
        increaseStartLine: increaseStartLine,
        decreaseStartLine: decreaseStartLine
    });

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var collectionUtils = createCommonjsModule(function (module) {

    var utils = module.exports = {};

    /**
     * Loops through the collection and calls the callback for each element. if the callback returns truthy, the loop is broken and returns the same value.
     * @public
     * @param {*} collection The collection to loop through. Needs to have a length property set and have indices set from 0 to length - 1.
     * @param {function} callback The callback to be called for each element. The element will be given as a parameter to the callback. If this callback returns truthy, the loop is broken and the same value is returned.
     * @returns {*} The value that a callback has returned (if truthy). Otherwise nothing.
     */
    utils.forEach = function(collection, callback) {
        for(var i = 0; i < collection.length; i++) {
            var result = callback(collection[i]);
            if(result) {
                return result;
            }
        }
    };
    });

    var elementUtils = function(options) {
        var getState = options.stateHandler.getState;

        /**
         * Tells if the element has been made detectable and ready to be listened for resize events.
         * @public
         * @param {element} The element to check.
         * @returns {boolean} True or false depending on if the element is detectable or not.
         */
        function isDetectable(element) {
            var state = getState(element);
            return state && !!state.isDetectable;
        }

        /**
         * Marks the element that it has been made detectable and ready to be listened for resize events.
         * @public
         * @param {element} The element to mark.
         */
        function markAsDetectable(element) {
            getState(element).isDetectable = true;
        }

        /**
         * Tells if the element is busy or not.
         * @public
         * @param {element} The element to check.
         * @returns {boolean} True or false depending on if the element is busy or not.
         */
        function isBusy(element) {
            return !!getState(element).busy;
        }

        /**
         * Marks the object is busy and should not be made detectable.
         * @public
         * @param {element} element The element to mark.
         * @param {boolean} busy If the element is busy or not.
         */
        function markBusy(element, busy) {
            getState(element).busy = !!busy;
        }

        return {
            isDetectable: isDetectable,
            markAsDetectable: markAsDetectable,
            isBusy: isBusy,
            markBusy: markBusy
        };
    };

    var listenerHandler = function(idHandler) {
        var eventListeners = {};

        /**
         * Gets all listeners for the given element.
         * @public
         * @param {element} element The element to get all listeners for.
         * @returns All listeners for the given element.
         */
        function getListeners(element) {
            var id = idHandler.get(element);

            if (id === undefined) {
                return [];
            }

            return eventListeners[id] || [];
        }

        /**
         * Stores the given listener for the given element. Will not actually add the listener to the element.
         * @public
         * @param {element} element The element that should have the listener added.
         * @param {function} listener The callback that the element has added.
         */
        function addListener(element, listener) {
            var id = idHandler.get(element);

            if(!eventListeners[id]) {
                eventListeners[id] = [];
            }

            eventListeners[id].push(listener);
        }

        function removeListener(element, listener) {
            var listeners = getListeners(element);
            for (var i = 0, len = listeners.length; i < len; ++i) {
                if (listeners[i] === listener) {
                  listeners.splice(i, 1);
                  break;
                }
            }
        }

        function removeAllListeners(element) {
          var listeners = getListeners(element);
          if (!listeners) { return; }
          listeners.length = 0;
        }

        return {
            get: getListeners,
            add: addListener,
            removeListener: removeListener,
            removeAllListeners: removeAllListeners
        };
    };

    var idGenerator = function() {
        var idCount = 1;

        /**
         * Generates a new unique id in the context.
         * @public
         * @returns {number} A unique id in the context.
         */
        function generate() {
            return idCount++;
        }

        return {
            generate: generate
        };
    };

    var idHandler = function(options) {
        var idGenerator     = options.idGenerator;
        var getState        = options.stateHandler.getState;

        /**
         * Gets the resize detector id of the element.
         * @public
         * @param {element} element The target element to get the id of.
         * @returns {string|number|null} The id of the element. Null if it has no id.
         */
        function getId(element) {
            var state = getState(element);

            if (state && state.id !== undefined) {
                return state.id;
            }

            return null;
        }

        /**
         * Sets the resize detector id of the element. Requires the element to have a resize detector state initialized.
         * @public
         * @param {element} element The target element to set the id of.
         * @returns {string|number|null} The id of the element.
         */
        function setId(element) {
            var state = getState(element);

            if (!state) {
                throw new Error("setId required the element to have a resize detection state.");
            }

            var id = idGenerator.generate();

            state.id = id;

            return id;
        }

        return {
            get: getId,
            set: setId
        };
    };

    /* global console: false */

    /**
     * Reporter that handles the reporting of logs, warnings and errors.
     * @public
     * @param {boolean} quiet Tells if the reporter should be quiet or not.
     */
    var reporter = function(quiet) {
        function noop() {
            //Does nothing.
        }

        var reporter = {
            log: noop,
            warn: noop,
            error: noop
        };

        if(!quiet && window.console) {
            var attachFunction = function(reporter, name) {
                //The proxy is needed to be able to call the method with the console context,
                //since we cannot use bind.
                reporter[name] = function reporterProxy() {
                    var f = console[name];
                    if (f.apply) { //IE9 does not support console.log.apply :)
                        f.apply(console, arguments);
                    } else {
                        for (var i = 0; i < arguments.length; i++) {
                            f(arguments[i]);
                        }
                    }
                };
            };

            attachFunction(reporter, "log");
            attachFunction(reporter, "warn");
            attachFunction(reporter, "error");
        }

        return reporter;
    };

    var browserDetector = createCommonjsModule(function (module) {

    var detector = module.exports = {};

    detector.isIE = function(version) {
        function isAnyIeVersion() {
            var agent = navigator.userAgent.toLowerCase();
            return agent.indexOf("msie") !== -1 || agent.indexOf("trident") !== -1 || agent.indexOf(" edge/") !== -1;
        }

        if(!isAnyIeVersion()) {
            return false;
        }

        if(!version) {
            return true;
        }

        //Shamelessly stolen from https://gist.github.com/padolsey/527683
        var ieVersion = (function(){
            var undef,
                v = 3,
                div = document.createElement("div"),
                all = div.getElementsByTagName("i");

            do {
                div.innerHTML = "<!--[if gt IE " + (++v) + "]><i></i><![endif]-->";
            }
            while (all[0]);

            return v > 4 ? v : undef;
        }());

        return version === ieVersion;
    };

    detector.isLegacyOpera = function() {
        return !!window.opera;
    };
    });

    var utils_1 = createCommonjsModule(function (module) {

    var utils = module.exports = {};

    utils.getOption = getOption;

    function getOption(options, name, defaultValue) {
        var value = options[name];

        if((value === undefined || value === null) && defaultValue !== undefined) {
            return defaultValue;
        }

        return value;
    }
    });

    var batchProcessor = function batchProcessorMaker(options) {
        options             = options || {};
        var reporter        = options.reporter;
        var asyncProcess    = utils_1.getOption(options, "async", true);
        var autoProcess     = utils_1.getOption(options, "auto", true);

        if(autoProcess && !asyncProcess) {
            reporter && reporter.warn("Invalid options combination. auto=true and async=false is invalid. Setting async=true.");
            asyncProcess = true;
        }

        var batch = Batch();
        var asyncFrameHandler;
        var isProcessing = false;

        function addFunction(level, fn) {
            if(!isProcessing && autoProcess && asyncProcess && batch.size() === 0) {
                // Since this is async, it is guaranteed to be executed after that the fn is added to the batch.
                // This needs to be done before, since we're checking the size of the batch to be 0.
                processBatchAsync();
            }

            batch.add(level, fn);
        }

        function processBatch() {
            // Save the current batch, and create a new batch so that incoming functions are not added into the currently processing batch.
            // Continue processing until the top-level batch is empty (functions may be added to the new batch while processing, and so on).
            isProcessing = true;
            while (batch.size()) {
                var processingBatch = batch;
                batch = Batch();
                processingBatch.process();
            }
            isProcessing = false;
        }

        function forceProcessBatch(localAsyncProcess) {
            if (isProcessing) {
                return;
            }

            if(localAsyncProcess === undefined) {
                localAsyncProcess = asyncProcess;
            }

            if(asyncFrameHandler) {
                cancelFrame(asyncFrameHandler);
                asyncFrameHandler = null;
            }

            if(localAsyncProcess) {
                processBatchAsync();
            } else {
                processBatch();
            }
        }

        function processBatchAsync() {
            asyncFrameHandler = requestFrame(processBatch);
        }

        function cancelFrame(listener) {
            // var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.clearTimeout;
            var cancel = clearTimeout;
            return cancel(listener);
        }

        function requestFrame(callback) {
            // var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function(fn) { return window.setTimeout(fn, 20); };
            var raf = function(fn) { return setTimeout(fn, 0); };
            return raf(callback);
        }

        return {
            add: addFunction,
            force: forceProcessBatch
        };
    };

    function Batch() {
        var batch       = {};
        var size        = 0;
        var topLevel    = 0;
        var bottomLevel = 0;

        function add(level, fn) {
            if(!fn) {
                fn = level;
                level = 0;
            }

            if(level > topLevel) {
                topLevel = level;
            } else if(level < bottomLevel) {
                bottomLevel = level;
            }

            if(!batch[level]) {
                batch[level] = [];
            }

            batch[level].push(fn);
            size++;
        }

        function process() {
            for(var level = bottomLevel; level <= topLevel; level++) {
                var fns = batch[level];

                for(var i = 0; i < fns.length; i++) {
                    var fn = fns[i];
                    fn();
                }
            }
        }

        function getSize() {
            return size;
        }

        return {
            add: add,
            process: process,
            size: getSize
        };
    }

    var prop = "_erd";

    function initState(element) {
        element[prop] = {};
        return getState(element);
    }

    function getState(element) {
        return element[prop];
    }

    function cleanState(element) {
        delete element[prop];
    }

    var stateHandler = {
        initState: initState,
        getState: getState,
        cleanState: cleanState
    };

    /**
     * Resize detection strategy that injects objects to elements in order to detect resize events.
     * Heavily inspired by: http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/
     */



    var object = function(options) {
        options             = options || {};
        var reporter        = options.reporter;
        var batchProcessor  = options.batchProcessor;
        var getState        = options.stateHandler.getState;

        if(!reporter) {
            throw new Error("Missing required dependency: reporter.");
        }

        /**
         * Adds a resize event listener to the element.
         * @public
         * @param {element} element The element that should have the listener added.
         * @param {function} listener The listener callback to be called for each resize event of the element. The element will be given as a parameter to the listener callback.
         */
        function addListener(element, listener) {
            function listenerProxy() {
                listener(element);
            }

            if(browserDetector.isIE(8)) {
                //IE 8 does not support object, but supports the resize event directly on elements.
                getState(element).object = {
                    proxy: listenerProxy
                };
                element.attachEvent("onresize", listenerProxy);
            } else {
                var object = getObject(element);

                if(!object) {
                    throw new Error("Element is not detectable by this strategy.");
                }

                object.contentDocument.defaultView.addEventListener("resize", listenerProxy);
            }
        }

        function buildCssTextString(rules) {
            var seperator = options.important ? " !important; " : "; ";

            return (rules.join(seperator) + seperator).trim();
        }

        /**
         * Makes an element detectable and ready to be listened for resize events. Will call the callback when the element is ready to be listened for resize changes.
         * @private
         * @param {object} options Optional options object.
         * @param {element} element The element to make detectable
         * @param {function} callback The callback to be called when the element is ready to be listened for resize changes. Will be called with the element as first parameter.
         */
        function makeDetectable(options, element, callback) {
            if (!callback) {
                callback = element;
                element = options;
                options = null;
            }

            options = options || {};
            options.debug;

            function injectObject(element, callback) {
                var OBJECT_STYLE = buildCssTextString(["display: block", "position: absolute", "top: 0", "left: 0", "width: 100%", "height: 100%", "border: none", "padding: 0", "margin: 0", "opacity: 0", "z-index: -1000", "pointer-events: none"]);

                //The target element needs to be positioned (everything except static) so the absolute positioned object will be positioned relative to the target element.

                // Position altering may be performed directly or on object load, depending on if style resolution is possible directly or not.
                var positionCheckPerformed = false;

                // The element may not yet be attached to the DOM, and therefore the style object may be empty in some browsers.
                // Since the style object is a reference, it will be updated as soon as the element is attached to the DOM.
                var style = window.getComputedStyle(element);
                var width = element.offsetWidth;
                var height = element.offsetHeight;

                getState(element).startSize = {
                    width: width,
                    height: height
                };

                function mutateDom() {
                    function alterPositionStyles() {
                        if(style.position === "static") {
                            element.style.setProperty("position", "relative", options.important ? "important" : "");

                            var removeRelativeStyles = function(reporter, element, style, property) {
                                function getNumericalValue(value) {
                                    return value.replace(/[^-\d\.]/g, "");
                                }

                                var value = style[property];

                                if(value !== "auto" && getNumericalValue(value) !== "0") {
                                    reporter.warn("An element that is positioned static has style." + property + "=" + value + " which is ignored due to the static positioning. The element will need to be positioned relative, so the style." + property + " will be set to 0. Element: ", element);
                                    element.style.setProperty(property, "0", options.important ? "important" : "");
                                }
                            };

                            //Check so that there are no accidental styles that will make the element styled differently now that is is relative.
                            //If there are any, set them to 0 (this should be okay with the user since the style properties did nothing before [since the element was positioned static] anyway).
                            removeRelativeStyles(reporter, element, style, "top");
                            removeRelativeStyles(reporter, element, style, "right");
                            removeRelativeStyles(reporter, element, style, "bottom");
                            removeRelativeStyles(reporter, element, style, "left");
                        }
                    }

                    function onObjectLoad() {
                        // The object has been loaded, which means that the element now is guaranteed to be attached to the DOM.
                        if (!positionCheckPerformed) {
                            alterPositionStyles();
                        }

                        /*jshint validthis: true */

                        function getDocument(element, callback) {
                            //Opera 12 seem to call the object.onload before the actual document has been created.
                            //So if it is not present, poll it with an timeout until it is present.
                            //TODO: Could maybe be handled better with object.onreadystatechange or similar.
                            if(!element.contentDocument) {
                                var state = getState(element);
                                if (state.checkForObjectDocumentTimeoutId) {
                                    window.clearTimeout(state.checkForObjectDocumentTimeoutId);
                                }
                                state.checkForObjectDocumentTimeoutId = setTimeout(function checkForObjectDocument() {
                                    state.checkForObjectDocumentTimeoutId = 0;
                                    getDocument(element, callback);
                                }, 100);

                                return;
                            }

                            callback(element.contentDocument);
                        }

                        //Mutating the object element here seems to fire another load event.
                        //Mutating the inner document of the object element is fine though.
                        var objectElement = this;

                        //Create the style element to be added to the object.
                        getDocument(objectElement, function onObjectDocumentReady(objectDocument) {
                            //Notify that the element is ready to be listened to.
                            callback(element);
                        });
                    }

                    // The element may be detached from the DOM, and some browsers does not support style resolving of detached elements.
                    // The alterPositionStyles needs to be delayed until we know the element has been attached to the DOM (which we are sure of when the onObjectLoad has been fired), if style resolution is not possible.
                    if (style.position !== "") {
                        alterPositionStyles();
                        positionCheckPerformed = true;
                    }

                    //Add an object element as a child to the target element that will be listened to for resize events.
                    var object = document.createElement("object");
                    object.style.cssText = OBJECT_STYLE;
                    object.tabIndex = -1;
                    object.type = "text/html";
                    object.setAttribute("aria-hidden", "true");
                    object.onload = onObjectLoad;

                    //Safari: This must occur before adding the object to the DOM.
                    //IE: Does not like that this happens before, even if it is also added after.
                    if(!browserDetector.isIE()) {
                        object.data = "about:blank";
                    }

                    if (!getState(element)) {
                        // The element has been uninstalled before the actual loading happened.
                        return;
                    }

                    element.appendChild(object);
                    getState(element).object = object;

                    //IE: This must occur after adding the object to the DOM.
                    if(browserDetector.isIE()) {
                        object.data = "about:blank";
                    }
                }

                if(batchProcessor) {
                    batchProcessor.add(mutateDom);
                } else {
                    mutateDom();
                }
            }

            if(browserDetector.isIE(8)) {
                //IE 8 does not support objects properly. Luckily they do support the resize event.
                //So do not inject the object and notify that the element is already ready to be listened to.
                //The event handler for the resize event is attached in the utils.addListener instead.
                callback(element);
            } else {
                injectObject(element, callback);
            }
        }

        /**
         * Returns the child object of the target element.
         * @private
         * @param {element} element The target element.
         * @returns The object element of the target.
         */
        function getObject(element) {
            return getState(element).object;
        }

        function uninstall(element) {
            if (!getState(element)) {
                return;
            }

            var object = getObject(element);

            if (!object) {
                return;
            }

            if (browserDetector.isIE(8)) {
                element.detachEvent("onresize", object.proxy);
            } else {
                element.removeChild(object);
            }

            if (getState(element).checkForObjectDocumentTimeoutId) {
                window.clearTimeout(getState(element).checkForObjectDocumentTimeoutId);
            }

            delete getState(element).object;
        }

        return {
            makeDetectable: makeDetectable,
            addListener: addListener,
            uninstall: uninstall
        };
    };

    /**
     * Resize detection strategy that injects divs to elements in order to detect resize events on scroll events.
     * Heavily inspired by: https://github.com/marcj/css-element-queries/blob/master/src/ResizeSensor.js
     */

    var forEach$1 = collectionUtils.forEach;

    var scroll = function(options) {
        options             = options || {};
        var reporter        = options.reporter;
        var batchProcessor  = options.batchProcessor;
        var getState        = options.stateHandler.getState;
        options.stateHandler.hasState;
        var idHandler       = options.idHandler;

        if (!batchProcessor) {
            throw new Error("Missing required dependency: batchProcessor");
        }

        if (!reporter) {
            throw new Error("Missing required dependency: reporter.");
        }

        //TODO: Could this perhaps be done at installation time?
        var scrollbarSizes = getScrollbarSizes();

        var styleId = "erd_scroll_detection_scrollbar_style";
        var detectionContainerClass = "erd_scroll_detection_container";

        function initDocument(targetDocument) {
            // Inject the scrollbar styling that prevents them from appearing sometimes in Chrome.
            // The injected container needs to have a class, so that it may be styled with CSS (pseudo elements).
            injectScrollStyle(targetDocument, styleId, detectionContainerClass);
        }

        initDocument(window.document);

        function buildCssTextString(rules) {
            var seperator = options.important ? " !important; " : "; ";

            return (rules.join(seperator) + seperator).trim();
        }

        function getScrollbarSizes() {
            var width = 500;
            var height = 500;

            var child = document.createElement("div");
            child.style.cssText = buildCssTextString(["position: absolute", "width: " + width*2 + "px", "height: " + height*2 + "px", "visibility: hidden", "margin: 0", "padding: 0"]);

            var container = document.createElement("div");
            container.style.cssText = buildCssTextString(["position: absolute", "width: " + width + "px", "height: " + height + "px", "overflow: scroll", "visibility: none", "top: " + -width*3 + "px", "left: " + -height*3 + "px", "visibility: hidden", "margin: 0", "padding: 0"]);

            container.appendChild(child);

            document.body.insertBefore(container, document.body.firstChild);

            var widthSize = width - container.clientWidth;
            var heightSize = height - container.clientHeight;

            document.body.removeChild(container);

            return {
                width: widthSize,
                height: heightSize
            };
        }

        function injectScrollStyle(targetDocument, styleId, containerClass) {
            function injectStyle(style, method) {
                method = method || function (element) {
                    targetDocument.head.appendChild(element);
                };

                var styleElement = targetDocument.createElement("style");
                styleElement.innerHTML = style;
                styleElement.id = styleId;
                method(styleElement);
                return styleElement;
            }

            if (!targetDocument.getElementById(styleId)) {
                var containerAnimationClass = containerClass + "_animation";
                var containerAnimationActiveClass = containerClass + "_animation_active";
                var style = "/* Created by the element-resize-detector library. */\n";
                style += "." + containerClass + " > div::-webkit-scrollbar { " + buildCssTextString(["display: none"]) + " }\n\n";
                style += "." + containerAnimationActiveClass + " { " + buildCssTextString(["-webkit-animation-duration: 0.1s", "animation-duration: 0.1s", "-webkit-animation-name: " + containerAnimationClass, "animation-name: " + containerAnimationClass]) + " }\n";
                style += "@-webkit-keyframes " + containerAnimationClass +  " { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }\n";
                style += "@keyframes " + containerAnimationClass +          " { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }";
                injectStyle(style);
            }
        }

        function addAnimationClass(element) {
            element.className += " " + detectionContainerClass + "_animation_active";
        }

        function addEvent(el, name, cb) {
            if (el.addEventListener) {
                el.addEventListener(name, cb);
            } else if(el.attachEvent) {
                el.attachEvent("on" + name, cb);
            } else {
                return reporter.error("[scroll] Don't know how to add event listeners.");
            }
        }

        function removeEvent(el, name, cb) {
            if (el.removeEventListener) {
                el.removeEventListener(name, cb);
            } else if(el.detachEvent) {
                el.detachEvent("on" + name, cb);
            } else {
                return reporter.error("[scroll] Don't know how to remove event listeners.");
            }
        }

        function getExpandElement(element) {
            return getState(element).container.childNodes[0].childNodes[0].childNodes[0];
        }

        function getShrinkElement(element) {
            return getState(element).container.childNodes[0].childNodes[0].childNodes[1];
        }

        /**
         * Adds a resize event listener to the element.
         * @public
         * @param {element} element The element that should have the listener added.
         * @param {function} listener The listener callback to be called for each resize event of the element. The element will be given as a parameter to the listener callback.
         */
        function addListener(element, listener) {
            var listeners = getState(element).listeners;

            if (!listeners.push) {
                throw new Error("Cannot add listener to an element that is not detectable.");
            }

            getState(element).listeners.push(listener);
        }

        /**
         * Makes an element detectable and ready to be listened for resize events. Will call the callback when the element is ready to be listened for resize changes.
         * @private
         * @param {object} options Optional options object.
         * @param {element} element The element to make detectable
         * @param {function} callback The callback to be called when the element is ready to be listened for resize changes. Will be called with the element as first parameter.
         */
        function makeDetectable(options, element, callback) {
            if (!callback) {
                callback = element;
                element = options;
                options = null;
            }

            options = options || {};

            function debug() {
                if (options.debug) {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift(idHandler.get(element), "Scroll: ");
                    if (reporter.log.apply) {
                        reporter.log.apply(null, args);
                    } else {
                        for (var i = 0; i < args.length; i++) {
                            reporter.log(args[i]);
                        }
                    }
                }
            }

            function isDetached(element) {
                function isInDocument(element) {
                    var isInShadowRoot = element.getRootNode && element.getRootNode().contains(element);
                    return element === element.ownerDocument.body || element.ownerDocument.body.contains(element) || isInShadowRoot;
                }

                if (!isInDocument(element)) {
                    return true;
                }

                // FireFox returns null style in hidden iframes. See https://github.com/wnr/element-resize-detector/issues/68 and https://bugzilla.mozilla.org/show_bug.cgi?id=795520
                if (window.getComputedStyle(element) === null) {
                    return true;
                }

                return false;
            }

            function isUnrendered(element) {
                // Check the absolute positioned container since the top level container is display: inline.
                var container = getState(element).container.childNodes[0];
                var style = window.getComputedStyle(container);
                return !style.width || style.width.indexOf("px") === -1; //Can only compute pixel value when rendered.
            }

            function getStyle() {
                // Some browsers only force layouts when actually reading the style properties of the style object, so make sure that they are all read here,
                // so that the user of the function can be sure that it will perform the layout here, instead of later (important for batching).
                var elementStyle            = window.getComputedStyle(element);
                var style                   = {};
                style.position              = elementStyle.position;
                style.width                 = element.offsetWidth;
                style.height                = element.offsetHeight;
                style.top                   = elementStyle.top;
                style.right                 = elementStyle.right;
                style.bottom                = elementStyle.bottom;
                style.left                  = elementStyle.left;
                style.widthCSS              = elementStyle.width;
                style.heightCSS             = elementStyle.height;
                return style;
            }

            function storeStartSize() {
                var style = getStyle();
                getState(element).startSize = {
                    width: style.width,
                    height: style.height
                };
                debug("Element start size", getState(element).startSize);
            }

            function initListeners() {
                getState(element).listeners = [];
            }

            function storeStyle() {
                debug("storeStyle invoked.");
                if (!getState(element)) {
                    debug("Aborting because element has been uninstalled");
                    return;
                }

                var style = getStyle();
                getState(element).style = style;
            }

            function storeCurrentSize(element, width, height) {
                getState(element).lastWidth = width;
                getState(element).lastHeight  = height;
            }

            function getExpandChildElement(element) {
                return getExpandElement(element).childNodes[0];
            }

            function getWidthOffset() {
                return 2 * scrollbarSizes.width + 1;
            }

            function getHeightOffset() {
                return 2 * scrollbarSizes.height + 1;
            }

            function getExpandWidth(width) {
                return width + 10 + getWidthOffset();
            }

            function getExpandHeight(height) {
                return height + 10 + getHeightOffset();
            }

            function getShrinkWidth(width) {
                return width * 2 + getWidthOffset();
            }

            function getShrinkHeight(height) {
                return height * 2 + getHeightOffset();
            }

            function positionScrollbars(element, width, height) {
                var expand          = getExpandElement(element);
                var shrink          = getShrinkElement(element);
                var expandWidth     = getExpandWidth(width);
                var expandHeight    = getExpandHeight(height);
                var shrinkWidth     = getShrinkWidth(width);
                var shrinkHeight    = getShrinkHeight(height);
                expand.scrollLeft   = expandWidth;
                expand.scrollTop    = expandHeight;
                shrink.scrollLeft   = shrinkWidth;
                shrink.scrollTop    = shrinkHeight;
            }

            function injectContainerElement() {
                var container = getState(element).container;

                if (!container) {
                    container                   = document.createElement("div");
                    container.className         = detectionContainerClass;
                    container.style.cssText     = buildCssTextString(["visibility: hidden", "display: inline", "width: 0px", "height: 0px", "z-index: -1", "overflow: hidden", "margin: 0", "padding: 0"]);
                    getState(element).container = container;
                    addAnimationClass(container);
                    element.appendChild(container);

                    var onAnimationStart = function () {
                        getState(element).onRendered && getState(element).onRendered();
                    };

                    addEvent(container, "animationstart", onAnimationStart);

                    // Store the event handler here so that they may be removed when uninstall is called.
                    // See uninstall function for an explanation why it is needed.
                    getState(element).onAnimationStart = onAnimationStart;
                }

                return container;
            }

            function injectScrollElements() {
                function alterPositionStyles() {
                    var style = getState(element).style;

                    if(style.position === "static") {
                        element.style.setProperty("position", "relative",options.important ? "important" : "");

                        var removeRelativeStyles = function(reporter, element, style, property) {
                            function getNumericalValue(value) {
                                return value.replace(/[^-\d\.]/g, "");
                            }

                            var value = style[property];

                            if(value !== "auto" && getNumericalValue(value) !== "0") {
                                reporter.warn("An element that is positioned static has style." + property + "=" + value + " which is ignored due to the static positioning. The element will need to be positioned relative, so the style." + property + " will be set to 0. Element: ", element);
                                element.style[property] = 0;
                            }
                        };

                        //Check so that there are no accidental styles that will make the element styled differently now that is is relative.
                        //If there are any, set them to 0 (this should be okay with the user since the style properties did nothing before [since the element was positioned static] anyway).
                        removeRelativeStyles(reporter, element, style, "top");
                        removeRelativeStyles(reporter, element, style, "right");
                        removeRelativeStyles(reporter, element, style, "bottom");
                        removeRelativeStyles(reporter, element, style, "left");
                    }
                }

                function getLeftTopBottomRightCssText(left, top, bottom, right) {
                    left = (!left ? "0" : (left + "px"));
                    top = (!top ? "0" : (top + "px"));
                    bottom = (!bottom ? "0" : (bottom + "px"));
                    right = (!right ? "0" : (right + "px"));

                    return ["left: " + left, "top: " + top, "right: " + right, "bottom: " + bottom];
                }

                debug("Injecting elements");

                if (!getState(element)) {
                    debug("Aborting because element has been uninstalled");
                    return;
                }

                alterPositionStyles();

                var rootContainer = getState(element).container;

                if (!rootContainer) {
                    rootContainer = injectContainerElement();
                }

                // Due to this WebKit bug https://bugs.webkit.org/show_bug.cgi?id=80808 (currently fixed in Blink, but still present in WebKit browsers such as Safari),
                // we need to inject two containers, one that is width/height 100% and another that is left/top -1px so that the final container always is 1x1 pixels bigger than
                // the targeted element.
                // When the bug is resolved, "containerContainer" may be removed.

                // The outer container can occasionally be less wide than the targeted when inside inline elements element in WebKit (see https://bugs.webkit.org/show_bug.cgi?id=152980).
                // This should be no problem since the inner container either way makes sure the injected scroll elements are at least 1x1 px.

                var scrollbarWidth          = scrollbarSizes.width;
                var scrollbarHeight         = scrollbarSizes.height;
                var containerContainerStyle = buildCssTextString(["position: absolute", "flex: none", "overflow: hidden", "z-index: -1", "visibility: hidden", "width: 100%", "height: 100%", "left: 0px", "top: 0px"]);
                var containerStyle          = buildCssTextString(["position: absolute", "flex: none", "overflow: hidden", "z-index: -1", "visibility: hidden"].concat(getLeftTopBottomRightCssText(-(1 + scrollbarWidth), -(1 + scrollbarHeight), -scrollbarHeight, -scrollbarWidth)));
                var expandStyle             = buildCssTextString(["position: absolute", "flex: none", "overflow: scroll", "z-index: -1", "visibility: hidden", "width: 100%", "height: 100%"]);
                var shrinkStyle             = buildCssTextString(["position: absolute", "flex: none", "overflow: scroll", "z-index: -1", "visibility: hidden", "width: 100%", "height: 100%"]);
                var expandChildStyle        = buildCssTextString(["position: absolute", "left: 0", "top: 0"]);
                var shrinkChildStyle        = buildCssTextString(["position: absolute", "width: 200%", "height: 200%"]);

                var containerContainer      = document.createElement("div");
                var container               = document.createElement("div");
                var expand                  = document.createElement("div");
                var expandChild             = document.createElement("div");
                var shrink                  = document.createElement("div");
                var shrinkChild             = document.createElement("div");

                // Some browsers choke on the resize system being rtl, so force it to ltr. https://github.com/wnr/element-resize-detector/issues/56
                // However, dir should not be set on the top level container as it alters the dimensions of the target element in some browsers.
                containerContainer.dir              = "ltr";

                containerContainer.style.cssText    = containerContainerStyle;
                containerContainer.className        = detectionContainerClass;
                container.className                 = detectionContainerClass;
                container.style.cssText             = containerStyle;
                expand.style.cssText                = expandStyle;
                expandChild.style.cssText           = expandChildStyle;
                shrink.style.cssText                = shrinkStyle;
                shrinkChild.style.cssText           = shrinkChildStyle;

                expand.appendChild(expandChild);
                shrink.appendChild(shrinkChild);
                container.appendChild(expand);
                container.appendChild(shrink);
                containerContainer.appendChild(container);
                rootContainer.appendChild(containerContainer);

                function onExpandScroll() {
                    getState(element).onExpand && getState(element).onExpand();
                }

                function onShrinkScroll() {
                    getState(element).onShrink && getState(element).onShrink();
                }

                addEvent(expand, "scroll", onExpandScroll);
                addEvent(shrink, "scroll", onShrinkScroll);

                // Store the event handlers here so that they may be removed when uninstall is called.
                // See uninstall function for an explanation why it is needed.
                getState(element).onExpandScroll = onExpandScroll;
                getState(element).onShrinkScroll = onShrinkScroll;
            }

            function registerListenersAndPositionElements() {
                function updateChildSizes(element, width, height) {
                    var expandChild             = getExpandChildElement(element);
                    var expandWidth             = getExpandWidth(width);
                    var expandHeight            = getExpandHeight(height);
                    expandChild.style.setProperty("width", expandWidth + "px", options.important ? "important" : "");
                    expandChild.style.setProperty("height", expandHeight + "px", options.important ? "important" : "");
                }

                function updateDetectorElements(done) {
                    var width           = element.offsetWidth;
                    var height          = element.offsetHeight;

                    // Check whether the size has actually changed since last time the algorithm ran. If not, some steps may be skipped.
                    var sizeChanged = width !== getState(element).lastWidth || height !== getState(element).lastHeight;

                    debug("Storing current size", width, height);

                    // Store the size of the element sync here, so that multiple scroll events may be ignored in the event listeners.
                    // Otherwise the if-check in handleScroll is useless.
                    storeCurrentSize(element, width, height);

                    // Since we delay the processing of the batch, there is a risk that uninstall has been called before the batch gets to execute.
                    // Since there is no way to cancel the fn executions, we need to add an uninstall guard to all fns of the batch.

                    batchProcessor.add(0, function performUpdateChildSizes() {
                        if (!sizeChanged) {
                            return;
                        }

                        if (!getState(element)) {
                            debug("Aborting because element has been uninstalled");
                            return;
                        }

                        if (!areElementsInjected()) {
                            debug("Aborting because element container has not been initialized");
                            return;
                        }

                        if (options.debug) {
                            var w = element.offsetWidth;
                            var h = element.offsetHeight;

                            if (w !== width || h !== height) {
                                reporter.warn(idHandler.get(element), "Scroll: Size changed before updating detector elements.");
                            }
                        }

                        updateChildSizes(element, width, height);
                    });

                    batchProcessor.add(1, function updateScrollbars() {
                        // This function needs to be invoked event though the size is unchanged. The element could have been resized very quickly and then
                        // been restored to the original size, which will have changed the scrollbar positions.

                        if (!getState(element)) {
                            debug("Aborting because element has been uninstalled");
                            return;
                        }

                        if (!areElementsInjected()) {
                            debug("Aborting because element container has not been initialized");
                            return;
                        }

                        positionScrollbars(element, width, height);
                    });

                    if (sizeChanged && done) {
                        batchProcessor.add(2, function () {
                            if (!getState(element)) {
                                debug("Aborting because element has been uninstalled");
                                return;
                            }

                            if (!areElementsInjected()) {
                              debug("Aborting because element container has not been initialized");
                              return;
                            }

                            done();
                        });
                    }
                }

                function areElementsInjected() {
                    return !!getState(element).container;
                }

                function notifyListenersIfNeeded() {
                    function isFirstNotify() {
                        return getState(element).lastNotifiedWidth === undefined;
                    }

                    debug("notifyListenersIfNeeded invoked");

                    var state = getState(element);

                    // Don't notify if the current size is the start size, and this is the first notification.
                    if (isFirstNotify() && state.lastWidth === state.startSize.width && state.lastHeight === state.startSize.height) {
                        return debug("Not notifying: Size is the same as the start size, and there has been no notification yet.");
                    }

                    // Don't notify if the size already has been notified.
                    if (state.lastWidth === state.lastNotifiedWidth && state.lastHeight === state.lastNotifiedHeight) {
                        return debug("Not notifying: Size already notified");
                    }


                    debug("Current size not notified, notifying...");
                    state.lastNotifiedWidth = state.lastWidth;
                    state.lastNotifiedHeight = state.lastHeight;
                    forEach$1(getState(element).listeners, function (listener) {
                        listener(element);
                    });
                }

                function handleRender() {
                    debug("startanimation triggered.");

                    if (isUnrendered(element)) {
                        debug("Ignoring since element is still unrendered...");
                        return;
                    }

                    debug("Element rendered.");
                    var expand = getExpandElement(element);
                    var shrink = getShrinkElement(element);
                    if (expand.scrollLeft === 0 || expand.scrollTop === 0 || shrink.scrollLeft === 0 || shrink.scrollTop === 0) {
                        debug("Scrollbars out of sync. Updating detector elements...");
                        updateDetectorElements(notifyListenersIfNeeded);
                    }
                }

                function handleScroll() {
                    debug("Scroll detected.");

                    if (isUnrendered(element)) {
                        // Element is still unrendered. Skip this scroll event.
                        debug("Scroll event fired while unrendered. Ignoring...");
                        return;
                    }

                    updateDetectorElements(notifyListenersIfNeeded);
                }

                debug("registerListenersAndPositionElements invoked.");

                if (!getState(element)) {
                    debug("Aborting because element has been uninstalled");
                    return;
                }

                getState(element).onRendered = handleRender;
                getState(element).onExpand = handleScroll;
                getState(element).onShrink = handleScroll;

                var style = getState(element).style;
                updateChildSizes(element, style.width, style.height);
            }

            function finalizeDomMutation() {
                debug("finalizeDomMutation invoked.");

                if (!getState(element)) {
                    debug("Aborting because element has been uninstalled");
                    return;
                }

                var style = getState(element).style;
                storeCurrentSize(element, style.width, style.height);
                positionScrollbars(element, style.width, style.height);
            }

            function ready() {
                callback(element);
            }

            function install() {
                debug("Installing...");
                initListeners();
                storeStartSize();

                batchProcessor.add(0, storeStyle);
                batchProcessor.add(1, injectScrollElements);
                batchProcessor.add(2, registerListenersAndPositionElements);
                batchProcessor.add(3, finalizeDomMutation);
                batchProcessor.add(4, ready);
            }

            debug("Making detectable...");

            if (isDetached(element)) {
                debug("Element is detached");

                injectContainerElement();

                debug("Waiting until element is attached...");

                getState(element).onRendered = function () {
                    debug("Element is now attached");
                    install();
                };
            } else {
                install();
            }
        }

        function uninstall(element) {
            var state = getState(element);

            if (!state) {
                // Uninstall has been called on a non-erd element.
                return;
            }

            // Uninstall may have been called in the following scenarios:
            // (1) Right between the sync code and async batch (here state.busy = true, but nothing have been registered or injected).
            // (2) In the ready callback of the last level of the batch by another element (here, state.busy = true, but all the stuff has been injected).
            // (3) After the installation process (here, state.busy = false and all the stuff has been injected).
            // So to be on the safe side, let's check for each thing before removing.

            // We need to remove the event listeners, because otherwise the event might fire on an uninstall element which results in an error when trying to get the state of the element.
            state.onExpandScroll && removeEvent(getExpandElement(element), "scroll", state.onExpandScroll);
            state.onShrinkScroll && removeEvent(getShrinkElement(element), "scroll", state.onShrinkScroll);
            state.onAnimationStart && removeEvent(state.container, "animationstart", state.onAnimationStart);

            state.container && element.removeChild(state.container);
        }

        return {
            makeDetectable: makeDetectable,
            addListener: addListener,
            uninstall: uninstall,
            initDocument: initDocument
        };
    };

    var forEach                 = collectionUtils.forEach;









    //Detection strategies.



    function isCollection(obj) {
        return Array.isArray(obj) || obj.length !== undefined;
    }

    function toArray(collection) {
        if (!Array.isArray(collection)) {
            var array = [];
            forEach(collection, function (obj) {
                array.push(obj);
            });
            return array;
        } else {
            return collection;
        }
    }

    function isElement(obj) {
        return obj && obj.nodeType === 1;
    }

    /**
     * @typedef idHandler
     * @type {object}
     * @property {function} get Gets the resize detector id of the element.
     * @property {function} set Generate and sets the resize detector id of the element.
     */

    /**
     * @typedef Options
     * @type {object}
     * @property {boolean} callOnAdd    Determines if listeners should be called when they are getting added.
                                        Default is true. If true, the listener is guaranteed to be called when it has been added.
                                        If false, the listener will not be guarenteed to be called when it has been added (does not prevent it from being called).
     * @property {idHandler} idHandler  A custom id handler that is responsible for generating, setting and retrieving id's for elements.
                                        If not provided, a default id handler will be used.
     * @property {reporter} reporter    A custom reporter that handles reporting logs, warnings and errors.
                                        If not provided, a default id handler will be used.
                                        If set to false, then nothing will be reported.
     * @property {boolean} debug        If set to true, the the system will report debug messages as default for the listenTo method.
     */

    /**
     * Creates an element resize detector instance.
     * @public
     * @param {Options?} options Optional global options object that will decide how this instance will work.
     */
    var elementResizeDetector = function(options) {
        options = options || {};

        //idHandler is currently not an option to the listenTo function, so it should not be added to globalOptions.
        var idHandler$1;

        if (options.idHandler) {
            // To maintain compatability with idHandler.get(element, readonly), make sure to wrap the given idHandler
            // so that readonly flag always is true when it's used here. This may be removed next major version bump.
            idHandler$1 = {
                get: function (element) { return options.idHandler.get(element, true); },
                set: options.idHandler.set
            };
        } else {
            var idGenerator$1 = idGenerator();
            var defaultIdHandler = idHandler({
                idGenerator: idGenerator$1,
                stateHandler: stateHandler
            });
            idHandler$1 = defaultIdHandler;
        }

        //reporter is currently not an option to the listenTo function, so it should not be added to globalOptions.
        var reporter$1 = options.reporter;

        if(!reporter$1) {
            //If options.reporter is false, then the reporter should be quiet.
            var quiet = reporter$1 === false;
            reporter$1 = reporter(quiet);
        }

        //batchProcessor is currently not an option to the listenTo function, so it should not be added to globalOptions.
        var batchProcessor$1 = getOption(options, "batchProcessor", batchProcessor({ reporter: reporter$1 }));

        //Options to be used as default for the listenTo function.
        var globalOptions = {};
        globalOptions.callOnAdd     = !!getOption(options, "callOnAdd", true);
        globalOptions.debug         = !!getOption(options, "debug", false);

        var eventListenerHandler    = listenerHandler(idHandler$1);
        var elementUtils$1            = elementUtils({
            stateHandler: stateHandler
        });

        //The detection strategy to be used.
        var detectionStrategy;
        var desiredStrategy = getOption(options, "strategy", "object");
        var importantCssRules = getOption(options, "important", false);
        var strategyOptions = {
            reporter: reporter$1,
            batchProcessor: batchProcessor$1,
            stateHandler: stateHandler,
            idHandler: idHandler$1,
            important: importantCssRules
        };

        if(desiredStrategy === "scroll") {
            if (browserDetector.isLegacyOpera()) {
                reporter$1.warn("Scroll strategy is not supported on legacy Opera. Changing to object strategy.");
                desiredStrategy = "object";
            } else if (browserDetector.isIE(9)) {
                reporter$1.warn("Scroll strategy is not supported on IE9. Changing to object strategy.");
                desiredStrategy = "object";
            }
        }

        if(desiredStrategy === "scroll") {
            detectionStrategy = scroll(strategyOptions);
        } else if(desiredStrategy === "object") {
            detectionStrategy = object(strategyOptions);
        } else {
            throw new Error("Invalid strategy name: " + desiredStrategy);
        }

        //Calls can be made to listenTo with elements that are still being installed.
        //Also, same elements can occur in the elements list in the listenTo function.
        //With this map, the ready callbacks can be synchronized between the calls
        //so that the ready callback can always be called when an element is ready - even if
        //it wasn't installed from the function itself.
        var onReadyCallbacks = {};

        /**
         * Makes the given elements resize-detectable and starts listening to resize events on the elements. Calls the event callback for each event for each element.
         * @public
         * @param {Options?} options Optional options object. These options will override the global options. Some options may not be overriden, such as idHandler.
         * @param {element[]|element} elements The given array of elements to detect resize events of. Single element is also valid.
         * @param {function} listener The callback to be executed for each resize event for each element.
         */
        function listenTo(options, elements, listener) {
            function onResizeCallback(element) {
                var listeners = eventListenerHandler.get(element);
                forEach(listeners, function callListenerProxy(listener) {
                    listener(element);
                });
            }

            function addListener(callOnAdd, element, listener) {
                eventListenerHandler.add(element, listener);

                if(callOnAdd) {
                    listener(element);
                }
            }

            //Options object may be omitted.
            if(!listener) {
                listener = elements;
                elements = options;
                options = {};
            }

            if(!elements) {
                throw new Error("At least one element required.");
            }

            if(!listener) {
                throw new Error("Listener required.");
            }

            if (isElement(elements)) {
                // A single element has been passed in.
                elements = [elements];
            } else if (isCollection(elements)) {
                // Convert collection to array for plugins.
                // TODO: May want to check so that all the elements in the collection are valid elements.
                elements = toArray(elements);
            } else {
                return reporter$1.error("Invalid arguments. Must be a DOM element or a collection of DOM elements.");
            }

            var elementsReady = 0;

            var callOnAdd = getOption(options, "callOnAdd", globalOptions.callOnAdd);
            var onReadyCallback = getOption(options, "onReady", function noop() {});
            var debug = getOption(options, "debug", globalOptions.debug);

            forEach(elements, function attachListenerToElement(element) {
                if (!stateHandler.getState(element)) {
                    stateHandler.initState(element);
                    idHandler$1.set(element);
                }

                var id = idHandler$1.get(element);

                debug && reporter$1.log("Attaching listener to element", id, element);

                if(!elementUtils$1.isDetectable(element)) {
                    debug && reporter$1.log(id, "Not detectable.");
                    if(elementUtils$1.isBusy(element)) {
                        debug && reporter$1.log(id, "System busy making it detectable");

                        //The element is being prepared to be detectable. Do not make it detectable.
                        //Just add the listener, because the element will soon be detectable.
                        addListener(callOnAdd, element, listener);
                        onReadyCallbacks[id] = onReadyCallbacks[id] || [];
                        onReadyCallbacks[id].push(function onReady() {
                            elementsReady++;

                            if(elementsReady === elements.length) {
                                onReadyCallback();
                            }
                        });
                        return;
                    }

                    debug && reporter$1.log(id, "Making detectable...");
                    //The element is not prepared to be detectable, so do prepare it and add a listener to it.
                    elementUtils$1.markBusy(element, true);
                    return detectionStrategy.makeDetectable({ debug: debug, important: importantCssRules }, element, function onElementDetectable(element) {
                        debug && reporter$1.log(id, "onElementDetectable");

                        if (stateHandler.getState(element)) {
                            elementUtils$1.markAsDetectable(element);
                            elementUtils$1.markBusy(element, false);
                            detectionStrategy.addListener(element, onResizeCallback);
                            addListener(callOnAdd, element, listener);

                            // Since the element size might have changed since the call to "listenTo", we need to check for this change,
                            // so that a resize event may be emitted.
                            // Having the startSize object is optional (since it does not make sense in some cases such as unrendered elements), so check for its existance before.
                            // Also, check the state existance before since the element may have been uninstalled in the installation process.
                            var state = stateHandler.getState(element);
                            if (state && state.startSize) {
                                var width = element.offsetWidth;
                                var height = element.offsetHeight;
                                if (state.startSize.width !== width || state.startSize.height !== height) {
                                    onResizeCallback(element);
                                }
                            }

                            if(onReadyCallbacks[id]) {
                                forEach(onReadyCallbacks[id], function(callback) {
                                    callback();
                                });
                            }
                        } else {
                            // The element has been unisntalled before being detectable.
                            debug && reporter$1.log(id, "Element uninstalled before being detectable.");
                        }

                        delete onReadyCallbacks[id];

                        elementsReady++;
                        if(elementsReady === elements.length) {
                            onReadyCallback();
                        }
                    });
                }

                debug && reporter$1.log(id, "Already detecable, adding listener.");

                //The element has been prepared to be detectable and is ready to be listened to.
                addListener(callOnAdd, element, listener);
                elementsReady++;
            });

            if(elementsReady === elements.length) {
                onReadyCallback();
            }
        }

        function uninstall(elements) {
            if(!elements) {
                return reporter$1.error("At least one element is required.");
            }

            if (isElement(elements)) {
                // A single element has been passed in.
                elements = [elements];
            } else if (isCollection(elements)) {
                // Convert collection to array for plugins.
                // TODO: May want to check so that all the elements in the collection are valid elements.
                elements = toArray(elements);
            } else {
                return reporter$1.error("Invalid arguments. Must be a DOM element or a collection of DOM elements.");
            }

            forEach(elements, function (element) {
                eventListenerHandler.removeAllListeners(element);
                detectionStrategy.uninstall(element);
                stateHandler.cleanState(element);
            });
        }

        function initDocument(targetDocument) {
            detectionStrategy.initDocument && detectionStrategy.initDocument(targetDocument);
        }

        return {
            listenTo: listenTo,
            removeListener: eventListenerHandler.removeListener,
            removeAllListeners: eventListenerHandler.removeAllListeners,
            uninstall: uninstall,
            initDocument: initDocument
        };
    };

    function getOption(options, name, defaultValue) {
        var value = options[name];

        if((value === undefined || value === null) && defaultValue !== undefined) {
            return defaultValue;
        }

        return value;
    }

    var erd = elementResizeDetector({ strategy: "scroll" });
    function watchResize(element, handler) {
        erd.listenTo(element, handler);
        var currentHandler = handler;
        return {
            update: function (newHandler) {
                erd.removeListener(element, currentHandler);
                erd.listenTo(element, newHandler);
                currentHandler = newHandler;
            },
            destroy: function () {
                erd.removeListener(element, currentHandler);
            },
        };
    }

    /* src\containers\svelte-tetris\svelte-tetris.svelte generated by Svelte v3.42.2 */
    const file$1 = "src\\containers\\svelte-tetris\\svelte-tetris.svelte";

    // (332:8) {#if isShowLogo}
    function create_if_block(ctx) {
    	let tlogo;
    	let current;
    	tlogo = new Logo({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(tlogo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tlogo, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tlogo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tlogo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tlogo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(332:8) {#if isShowLogo}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div5;
    	let div4;
    	let tscreen;
    	let t0;
    	let div3;
    	let div2;
    	let tmatrix;
    	let t1;
    	let t2;
    	let div1;
    	let tpoint;
    	let t3;
    	let tstartline;
    	let t4;
    	let tlevel;
    	let t5;
    	let tnext;
    	let t6;
    	let div0;
    	let tsound;
    	let t7;
    	let tpause;
    	let t8;
    	let tclock;
    	let t9;
    	let tkeyboard;
    	let current;
    	let mounted;
    	let dispose;
    	tscreen = new Screen({ $$inline: true });
    	tmatrix = new Matrix({ $$inline: true });
    	let if_block = /*isShowLogo*/ ctx[3] && create_if_block(ctx);
    	tpoint = new Point({ $$inline: true });
    	tstartline = new Start_line({ $$inline: true });
    	tlevel = new Level({ $$inline: true });
    	tnext = new Next({ $$inline: true });
    	tsound = new Sound({ $$inline: true });
    	tpause = new Pause({ $$inline: true });
    	tclock = new Clock({ $$inline: true });

    	tkeyboard = new Keyboard({
    			props: { filling: /*filling*/ ctx[0] },
    			$$inline: true
    		});

    	tkeyboard.$on("mousekeydown", /*keyboardMouseDown*/ ctx[4]);
    	tkeyboard.$on("mousekeyup", /*keyboardMouseUp*/ ctx[5]);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			create_component(tscreen.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			create_component(tmatrix.$$.fragment);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			div1 = element("div");
    			create_component(tpoint.$$.fragment);
    			t3 = space();
    			create_component(tstartline.$$.fragment);
    			t4 = space();
    			create_component(tlevel.$$.fragment);
    			t5 = space();
    			create_component(tnext.$$.fragment);
    			t6 = space();
    			div0 = element("div");
    			create_component(tsound.$$.fragment);
    			t7 = space();
    			create_component(tpause.$$.fragment);
    			t8 = space();
    			create_component(tclock.$$.fragment);
    			t9 = space();
    			create_component(tkeyboard.$$.fragment);
    			attr_dev(div0, "class", "last-row");
    			add_location(div0, file$1, 339, 10, 8535);
    			attr_dev(div1, "class", "state");
    			add_location(div1, file$1, 334, 8, 8413);
    			attr_dev(div2, "class", "panel svelte-17431so");
    			add_location(div2, file$1, 329, 6, 8301);
    			attr_dev(div3, "class", "screen svelte-17431so");
    			add_location(div3, file$1, 328, 4, 8273);
    			attr_dev(div4, "class", "react svelte-17431so");
    			toggle_class(div4, "drop", /*drop*/ ctx[2]);
    			add_location(div4, file$1, 326, 2, 8220);
    			attr_dev(div5, "id", "host");
    			attr_dev(div5, "class", "svelte-17431so");
    			add_location(div5, file$1, 325, 0, 8152);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			mount_component(tscreen, div4, null);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			mount_component(tmatrix, div2, null);
    			append_dev(div2, t1);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			mount_component(tpoint, div1, null);
    			append_dev(div1, t3);
    			mount_component(tstartline, div1, null);
    			append_dev(div1, t4);
    			mount_component(tlevel, div1, null);
    			append_dev(div1, t5);
    			mount_component(tnext, div1, null);
    			append_dev(div1, t6);
    			append_dev(div1, div0);
    			mount_component(tsound, div0, null);
    			append_dev(div0, t7);
    			mount_component(tpause, div0, null);
    			append_dev(div0, t8);
    			mount_component(tclock, div0, null);
    			append_dev(div5, t9);
    			mount_component(tkeyboard, div5, null);
    			/*div5_binding*/ ctx[10](div5);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keydown", /*handleKeyboardDown*/ ctx[6], false, false, false),
    					listen_dev(window, "keyup", /*handleKeyboardUp*/ ctx[7], false, false, false),
    					listen_dev(window, "resize", /*handlerResize*/ ctx[8], false, false, false),
    					listen_dev(window, "error", /*unloadHandler*/ ctx[9], false, false, false),
    					action_destroyer(watchResize.call(null, div5, /*handlerResize*/ ctx[8]))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*isShowLogo*/ ctx[3]) {
    				if (if_block) {
    					if (dirty[0] & /*isShowLogo*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div2, t2);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*drop*/ 4) {
    				toggle_class(div4, "drop", /*drop*/ ctx[2]);
    			}

    			const tkeyboard_changes = {};
    			if (dirty[0] & /*filling*/ 1) tkeyboard_changes.filling = /*filling*/ ctx[0];
    			tkeyboard.$set(tkeyboard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tscreen.$$.fragment, local);
    			transition_in(tmatrix.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(tpoint.$$.fragment, local);
    			transition_in(tstartline.$$.fragment, local);
    			transition_in(tlevel.$$.fragment, local);
    			transition_in(tnext.$$.fragment, local);
    			transition_in(tsound.$$.fragment, local);
    			transition_in(tpause.$$.fragment, local);
    			transition_in(tclock.$$.fragment, local);
    			transition_in(tkeyboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tscreen.$$.fragment, local);
    			transition_out(tmatrix.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(tpoint.$$.fragment, local);
    			transition_out(tstartline.$$.fragment, local);
    			transition_out(tlevel.$$.fragment, local);
    			transition_out(tnext.$$.fragment, local);
    			transition_out(tsound.$$.fragment, local);
    			transition_out(tpause.$$.fragment, local);
    			transition_out(tclock.$$.fragment, local);
    			transition_out(tkeyboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(tscreen);
    			destroy_component(tmatrix);
    			if (if_block) if_block.d();
    			destroy_component(tpoint);
    			destroy_component(tstartline);
    			destroy_component(tlevel);
    			destroy_component(tnext);
    			destroy_component(tsound);
    			destroy_component(tpause);
    			destroy_component(tclock);
    			destroy_component(tkeyboard);
    			/*div5_binding*/ ctx[10](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Svelte_tetris', slots, []);
    	
    	let filling;
    	let host;
    	let drop$$1;
    	let isShowLogo$$1;
    	let drop$1;
    	let isShowLogo;

    	function resize() {
    		const width = document.documentElement.clientWidth;
    		const height = document.documentElement.clientHeight;
    		const ratio = height / width;
    		let scale = 1;

    		if (ratio < 1.5) {
    			scale = height / 960;
    		} else {
    			scale = width / 640;
    			$$invalidate(0, filling = (height - 960 * scale) / scale / 3);
    			const paddingTop = Math.floor(filling) + 42;
    			const paddingBottom = Math.floor(filling);
    			const marginTop = Math.floor(-480 - filling * 1.5);
    			setPaddingMargin(paddingTop, paddingBottom, marginTop);
    		}

    		$$invalidate(1, host.style.transform = `scale(${scale - 0.02})`, host);
    	}

    	function setPaddingMargin(paddingTop, paddingBottom, marginTop) {
    		$$invalidate(1, host.style.paddingTop = `${paddingTop}px`, host);
    		$$invalidate(1, host.style.paddingBottom = `${paddingBottom}px`, host);
    		$$invalidate(1, host.style.marginTop = `${marginTop}px`, host);
    	}

    	function keyDownLeft() {
    		move();
    		setKeỵ({ left: true });

    		if (hasCurrent()) {
    			moveLeft();
    		} else {
    			decreaseLevel();
    		}
    	}

    	function keyUpLeft() {
    		setKeỵ({ left: false });
    	}

    	function keyDownRight() {
    		move();
    		setKeỵ({ right: true });

    		if (hasCurrent()) {
    			moveRight();
    		} else {
    			increaseLevel();
    		}
    	}

    	function keyUpRight() {
    		setKeỵ({ right: false });
    	}

    	function keyDownUp() {
    		rotate$1();
    		setKeỵ({ up: true });

    		if (hasCurrent()) {
    			rotate();
    		} else {
    			increaseStartLine();
    		}
    	}

    	function keyUpUp() {
    		setKeỵ({ up: false });
    	}

    	function keyDownDown() {
    		move();
    		setKeỵ({ down: true });

    		if (hasCurrent()) {
    			moveDown();
    		} else {
    			decreaseStartLine();
    		}
    	}

    	function keyUpDown() {
    		setKeỵ({ down: false });
    	}

    	function keyDownSpace() {
    		setKeỵ({ drop: true });

    		if (hasCurrent()) {
    			fall();
    			drop();
    			return;
    		}

    		start$1();
    		start();
    	}

    	function keyUpSpace() {
    		setKeỵ({ drop: false });
    	}

    	function keyDownSound() {
    		move();
    		setSound();
    		setKeỵ({ sound: true });
    	}

    	function keyUpSound() {
    		setKeỵ({ sound: false });
    	}

    	function keyDownPause() {
    		move();
    		setKeỵ({ pause: true });

    		if (canStartGame()) {
    			resume();
    		} else {
    			pause();
    		}
    	}

    	function keyUpPause() {
    		setKeỵ({ pause: false });
    	}

    	function keyDownReset() {
    		move();
    		setKeỵ({ reset: true });
    		pause();

    		setTimeout(() => {
    			if (confirm("Are you sure you want to reset?")) {
    				reset();
    			} else {
    				resume();
    			}

    			keyUpReset();
    		});
    	}

    	function keyUpReset() {
    		setKeỵ({ reset: false });
    	}

    	function hasCurrent() {
    		return !!current();
    	}

    	function keyboardMouseDown(event) {
    		switch (`keyDown${event.detail.key}`) {
    			case "keyDownUp":
    				keyDownUp();
    				break;
    			case "keyDownDown":
    				keyDownDown();
    				break;
    			case "keyDownLeft":
    				keyDownLeft();
    				break;
    			case "keyDownRight":
    				keyDownRight();
    				break;
    			case "keyDownSound":
    				keyDownSound();
    				break;
    			case "keyDownReset":
    				keyDownReset();
    				break;
    			case "keyDownPause":
    				keyDownPause();
    				break;
    			case "keyDownSpace":
    				keyDownSpace();
    				break;
    		}
    	}

    	function keyboardMouseUp(event) {
    		switch (`keyUp${event.detail.key}`) {
    			case "keyUpUp":
    				keyUpUp();
    				break;
    			case "keyUpDown":
    				keyUpDown();
    				break;
    			case "keyUpLeft":
    				keyUpLeft();
    				break;
    			case "keyUpRight":
    				keyUpRight();
    				break;
    			case "keyUpSound":
    				keyUpSound();
    				break;
    			case "keyUpReset":
    				keyUpReset();
    				break;
    			case "keyUpPause":
    				keyUpPause();
    				break;
    			case "keyUpSpace":
    				keyUpSpace();
    				break;
    		}
    	}

    	function handleKeyboardDown(event) {
    		switch (event.keyCode) {
    			case 38:
    				keyDownUp();
    				break;
    			case 40:
    				keyDownDown();
    				break;
    			case 37:
    				keyDownLeft();
    				break;
    			case 39:
    				keyDownRight();
    				break;
    			case 83:
    				keyDownSound();
    				break;
    			case 82:
    				keyDownReset();
    				break;
    			case 80:
    				keyDownPause();
    				break;
    			case 32:
    				keyDownSpace();
    				break;
    		}
    	}

    	function handleKeyboardUp(event) {
    		switch (event.keyCode) {
    			case 38:
    				keyUpUp();
    				break;
    			case 40:
    				keyUpDown();
    				break;
    			case 37:
    				keyUpLeft();
    				break;
    			case 39:
    				keyUpRight();
    				break;
    			case 83:
    				keyUpSound();
    				break;
    			case 82:
    				keyUpReset();
    				break;
    			case 80:
    				keyUpPause();
    				break;
    			case 32:
    				keyUpSpace();
    				break;
    		}
    	}

    	function handlerResize(node) {
    		resize();
    	}

    	function unloadHandler(event) {
    		reset();
    	}

    	onMount(() => {
    		drop$$1 = drop$.subscribe(val => $$invalidate(2, drop$1 = val));
    		isShowLogo$$1 = isShowLogo$.subscribe(val => $$invalidate(3, isShowLogo = val));
    	});

    	onDestroy(() => {
    		drop$$1.unsubscribe();
    		isShowLogo$$1.unsubscribe();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Svelte_tetris> was created with unknown prop '${key}'`);
    	});

    	function div5_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			host = $$value;
    			$$invalidate(1, host);
    		});
    	}

    	$$self.$capture_state = () => ({
    		Tscreen: Screen,
    		Tlogo: Logo,
    		Tpoint: Point,
    		TstartLine: Start_line,
    		Tlevel: Level,
    		Tnext: Next,
    		Tsound: Sound,
    		Tpause: Pause,
    		Tclock: Clock,
    		Tkeyboard: Keyboard,
    		Tmatrix: Matrix,
    		onDestroy,
    		onMount,
    		_soundService,
    		_keyboardService,
    		_keyboardQuery,
    		_tetrisService,
    		_tetrisQuery,
    		watchResize,
    		filling,
    		host,
    		drop$: drop$$1,
    		isShowLogo$: isShowLogo$$1,
    		drop: drop$1,
    		isShowLogo,
    		resize,
    		setPaddingMargin,
    		keyDownLeft,
    		keyUpLeft,
    		keyDownRight,
    		keyUpRight,
    		keyDownUp,
    		keyUpUp,
    		keyDownDown,
    		keyUpDown,
    		keyDownSpace,
    		keyUpSpace,
    		keyDownSound,
    		keyUpSound,
    		keyDownPause,
    		keyUpPause,
    		keyDownReset,
    		keyUpReset,
    		hasCurrent,
    		keyboardMouseDown,
    		keyboardMouseUp,
    		handleKeyboardDown,
    		handleKeyboardUp,
    		handlerResize,
    		unloadHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ('filling' in $$props) $$invalidate(0, filling = $$props.filling);
    		if ('host' in $$props) $$invalidate(1, host = $$props.host);
    		if ('drop$' in $$props) drop$$1 = $$props.drop$;
    		if ('isShowLogo$' in $$props) isShowLogo$$1 = $$props.isShowLogo$;
    		if ('drop' in $$props) $$invalidate(2, drop$1 = $$props.drop);
    		if ('isShowLogo' in $$props) $$invalidate(3, isShowLogo = $$props.isShowLogo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		filling,
    		host,
    		drop$1,
    		isShowLogo,
    		keyboardMouseDown,
    		keyboardMouseUp,
    		handleKeyboardDown,
    		handleKeyboardUp,
    		handlerResize,
    		unloadHandler,
    		div5_binding
    	];
    }

    class Svelte_tetris extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Svelte_tetris",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.42.2 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let tsveltetetris;
    	let current;
    	tsveltetetris = new Svelte_tetris({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(tsveltetetris.$$.fragment);
    			add_location(main, file, 3, 0, 109);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(tsveltetetris, main, null);
    			current = true;
    		},
    		p: noop$1,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tsveltetetris.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tsveltetetris.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(tsveltetetris);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ TsvelteTetris: Svelte_tetris });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    akitaDevtools();
    persistState();
    const app = new App({
        target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
