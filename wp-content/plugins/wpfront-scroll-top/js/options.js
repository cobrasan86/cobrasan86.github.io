(function () {
    'use strict'

    let $ = jQuery;

    let appData = { loading: true, error: '', nonce: '' };
    let $app = null;

    function postData(action, data) {
        data = data || null;
        return new Promise(function (resolve, reject) {
            $.post(ajaxurl + '?action=' + action, { data: JSON.stringify(data), _ajax_nonce: appData.nonce })
                .done(function(response){
                    if(response.success) {
                        resolve(response.data);
                    } else {
                        reject(response.data);
                    }
                })
                .fail(reject);
        });
    }

    let timeoutID = 0;
    function handleError(error) {
        console.log(error);

        if(typeof error !== 'string') {
            if(error.statusText) {
                error = error.statusText;
            } else {
                error = 'Error';
            }
        }

        $app.error = error;
        $app.loading = false;

        clearTimeout(timeoutID);
        timeoutID = setTimeout(() => $app.error = '', 5000);
    }

    let promiseData = postData('wpfront_scroll_top_get_data')
        .then(result => {
            appData.data = result.data;
            appData.nonce = result.nonce;
        });

    let app = Vue.createApp({
        data() {
            return appData;
        },
        created(){
            $(function () {
                $('#scroll-top-content').find('.if-js-closed').removeClass('if-js-closed').addClass('closed');
                postboxes.add_postbox_toggles('wpfront-scroll-top');
            });
        },
        mounted() {
            $app = this;
            this.loading = false;
        },
        methods: {
            submit() {
                if(this.loading) {
                    return;
                }

                this.loading = true;
                this.error = '';

                postData('wpfront_scroll_top_submit_data', appData.data)
                    .then((url) =>  {
                        window.location.replace(url); 
                    })
                    .catch(error => { 
                        handleError(error);
                    });
            }
        }
    });

    app.use(ElementPlus);

    let promiseComponents;

    function loadComponents(version) {
        promiseComponents = fetch(ajaxurl + '?action=wpfront_scroll_top_get_static&v=' + version)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }

                return Promise.reject('bad request');
            })
            .then(result => {
                if(!result.success) {
                    return Promise.reject(result.data);
                }

                return result.data;
            })
            .then(result => {
                appData.labels = result.labels;
                appData.help = result.help;
                appData.location_options = result.location_options;
                appData.button_style_options = result.button_style_options;
                appData.button_action_options = result.button_action_options;
                appData.icons_list = result.icons_list;
                appData.filter_options = result.filter_options;
                appData.filter_posts_list = result.filter_posts_list;
                appData.current_location = result.current_url;

                return result.templates; 
               
            })
            .then(components => {
                app.component('DisplaySettings', {
                    template: components['display-settings'],
                    data: () => appData
                });

                app.component('ButtonActionSettings', {
                    template: components['button-action-settings'],
                    data: () => appData
                });

                app.component('LocationSettings', {
                    template: components['location-settings'],
                    data: () => appData
                });

                app.component('ImageButtonSettings', {
                    template: components['image-button-settings'],
                    data: () => appData,
                    methods: {
                        mediaLibrary() {
                            var self = this;

                            if(!wp.media.frames.file_frame) {
                                wp.media.frames.file_frame = wp.media({
                                    title: appData.labels.media_library_title,
                                    multiple: false,
                                    'library': {
                                        type: 'image'
                                    },
                                    button: {
                                    text: appData.labels.media_library_text
                                    }
                                }).on('select', function() {
                                    var obj = wp.media.frames.file_frame.state().get('selection').first().toJSON();

                                    self.data.custom_url = obj.url;
                                    self.data.image = 'custom';
                                    self.data.image_alt = self.data.image_alt || obj.alt || obj.title;
                                });
                            }

                            wp.media.frames.file_frame.open();
                        }
                    }
                });

                app.component('FontAwesomeButtonSettings', {
                    template: components['font-awesome-button-settings'],
                    data: () => appData
                });

                app.component('TextButtonSettings', {
                    template: components['text-button-settings'],
                    data: () => appData
                });

                app.component('HelpIcon', {
                    props: ['helpText'],
                    template: components['help-icon']
                });

                app.component('ColorPicker', {
                    props: ['modelValue'],
                    template: components['color-picker']
                });

                app.component('FilterSettings', {
                    template: components['filter-settings'],
                    data: () => appData
                });

                app.component('PostsFilterSelection', {
                    props: ['modelValue', 'postsList'],
                    template: components['posts-filter-selection'],
                    computed: {
                        selectedPosts: {
                            get() {
                                return this.modelValue.split(',');
                            },
                            set(values) {
                                this.$emit('update:modelValue', values.filter(e => e).join().trim());
                            }
                        }
                    }
                });

            });
    }

    function load() {
        if ($('#scroll-top-content').length > 0) {
            Promise.all([promiseData, promiseComponents])
                .then(() =>  {
                    app.mount('#scroll-top-content');  
                })
                .catch(error => { 
                    handleError(error);
                });
        } else {
            setTimeout(load, 200);
        }
    }

    window.load_wpf_st = function(version) {
        loadComponents(version);
        load();
    };

})();