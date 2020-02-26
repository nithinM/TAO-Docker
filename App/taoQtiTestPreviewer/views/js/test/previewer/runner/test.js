/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'core/promise',
    'taoQtiTestPreviewer/previewer/runner',
    'json!taoQtiItem/test/samples/json/space-shuttle.json',
    'lib/jquery.mockjax/jquery.mockjax',
    'css!taoQtiTestPreviewer/previewer/provider/item/css/item'
], function ($, _, Promise, previewerFactory, itemData) {
    'use strict';

    QUnit.module('API');


    // prevent the AJAX mocks to pollute the logs
    $.mockjaxSettings.logger = null;
    $.mockjaxSettings.responseTime = 1;

    // restore AJAX method after each test
    QUnit.testDone(function () {
        $.mockjax.clear();
    });


    QUnit.asyncTest('module', function (assert) {
        var config = {
            serviceCallId: 'foo',
            provider: 'qtiItemPreviewer',
            providers: [{
                'id' : 'qtiItemPreviewer',
                'module' : 'taoQtiTestPreviewer/previewer/provider/item/item',
                'bundle' : 'taoQtiTestPreviewer/loader/qtiPreviewer.min',
                'category' : 'previewer'
            }]
        };

        var previewer1 = previewerFactory(config, $('#fixture-1'));
        var previewer2 = previewerFactory(config, $('#fixture-2'));

        QUnit.expect(4);
        $.mockjax({
            url: '/*',
            responseText: {
                success: true
            }
        });
        assert.equal(typeof previewerFactory, 'function', "The previewer module exposes a function");
        assert.equal(typeof previewer1, 'object', "The previewer factory returns an object");
        assert.equal(typeof previewer2, 'object', "The previewer factory returns an object");
        assert.notEqual(previewer1, previewer2, "The previewer factory returns a different instance on each call");

        Promise.all([
            new Promise(function(resolve) {
                previewer1.on('ready', resolve);
            }),
            new Promise(function(resolve) {
                previewer2.on('ready', resolve);
            })
        ]).catch(function(err) {
            console.error(err);
        }).then(function() {
            QUnit.start();
        });
    });


    QUnit.cases([{
        title: 'itemData in init',
        fixture: '#fixture-item-1',
        mock: {
            url: '/init*',
            responseText: {
                success: true,
                itemIdentifier: 'item-1',
                itemData: {
                    content: {
                        type: 'qti',
                        data: itemData
                    },
                    baseUrl: '',
                    state: {}
                }
            }
        }
    }, {
        title: 'itemRef in init',
        fixture: '#fixture-item-2',
        mock: [{
            url: '/init*',
            responseText: {
                success: true,
                itemIdentifier: 'item-2'
            }
        }, {
            url: '/getItem*',
            responseText: {
                success: true,
                content: {
                    type: 'qti',
                    data: itemData
                },
                baseUrl: '',
                state: {}
            }
        }]
    }, {
        title: 'manual load',
        fixture: '#fixture-item-3',
        itemIdentifier: 'item-3',
        mock: [{
            url: '/init*',
            responseText: {
                success: true
            }
        }, {
            url: '/getItem*',
            responseText: {
                success: true,
                content: {
                    type: 'qti',
                    data: itemData
                },
                baseUrl: '',
                state: {}
            }
        }]
    }]).asyncTest('render item ', function (data, assert) {
        var $container = $(data.fixture);
        var serviceCallId = 'previewer';
        var config = {
            serviceCallId: serviceCallId,
            provider: 'qtiItemPreviewer',
            providers: [{
                'id' : 'qtiItemPreviewer',
                'module' : 'taoQtiTestPreviewer/previewer/provider/item/item',
                'bundle' : 'taoQtiTestPreviewer/loader/qtiPreviewer.min',
                'category' : 'previewer'
            }]
        };

        QUnit.expect(1);

        $.mockjax(data.mock);

        previewerFactory(config, $container)
            .on('error', function (err) {
                console.error(err);
                assert.ok(false, 'An error has occurred');
                QUnit.start();
            })
            .on('ready', function (runner) {
                runner
                    .after('renderitem', function () {
                        assert.ok(true, 'The previewer has been rendered');
                        QUnit.start();
                    });

                if (data.itemIdentifier) {
                    runner.loadItem(data.itemIdentifier);
                }
            });
    });


    QUnit.asyncTest('integration', function (assert) {
        var $container = $('#previewer');
        var serviceCallId = 'previewer';
        var itemRef = 'item-1';
        var config = {
            serviceCallId: serviceCallId,
            provider: 'qtiItemPreviewer',
            providers: [{
                'id' : 'qtiItemPreviewer',
                'module' : 'taoQtiTestPreviewer/previewer/provider/item/item',
                'bundle' : 'taoQtiTestPreviewer/loader/qtiPreviewer.min',
                'category' : 'previewer'
            }],
            plugins: [{
                module: 'taoQtiTestPreviewer/previewer/plugins/navigation/submit/submit',
                bundle: 'taoQtiTestPreviewer/loader/qtiPreviewer.min',
                category: 'navigation'
            }, {
                module: 'taoQtiTest/runner/plugins/tools/itemThemeSwitcher/itemThemeSwitcher',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                category: 'tools'
            }]
        };

        QUnit.expect(1);

        $.mockjax({
            url: '/init*',
            responseText: {
                success: true
            }
        });
        $.mockjax({
            url: '/getItem*',
            responseText: {
                success: true,
                content: {
                    type: 'qti',
                    data: itemData
                },
                baseUrl: '',
                state: {}
            }
        });

        previewerFactory(config, $container)
            .on('error', function (err) {
                console.error(err);
                assert.ok(false, 'An error has occurred');
                QUnit.start();
            })
            .on('ready', function (runner) {
                runner

                    .after('renderitem.runnerComponent', function () {
                        assert.ok(true, 'The previewer has been rendered');
                        QUnit.start();
                    })
                    .loadItem(itemRef);
            });
    });
});
