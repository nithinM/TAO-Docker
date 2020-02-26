<?php
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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA
 */

namespace oat\libCat;

use GuzzleHttp\ClientInterface;
use oat\libCat\exception\CatEngineConnectivityException;
use oat\libCat\exception\CatEngineException;

/**
 * Class AbstractCatEngine
 * @package oat\libCat
 * @author Aleh Hutnikau, <hutnikau@1pt.com>
 */
abstract class AbstractCatEngine implements CatEngine
{
    /** @var string The base url of CatEngine */
    protected $endpoint;

    /** @var ClientInterface The client to handle the request */
    protected $client;

    /** @var  string The API version to reach */
    protected $version;

    /**
     * Setup the cat engine
     *
     * @param string          $endpoint URL of the service.
     * @param string          $version  In case if version is not defined, put value considered as empty string (''|null|false).
     * @param ClientInterface $client
     */
    public function __construct($endpoint, $version, ClientInterface $client)
    {
        $this->endpoint = rtrim($endpoint, '/');
        $this->version = (string)$version;
        $this->client = $client;
    }

    /**
     * (non-PHPdoc)
     * @see \oat\libCat\CatEngine::setupSection()
     */
    public function setupSection($configuration, $qtiUsageData = null, $qtiMetaData = null)
    {
        return $this->createSection($configuration, $qtiUsageData, $qtiMetaData);
    }

    /**
     * (non-PHPdoc)
     * @see \oat\libCat\CatEngine::restoreSection()
     */
    abstract public function restoreSection($jsonString);

    /**
     * Helper to facilitate calls to the server. Wrap the call to EchoAdapt client.
     * Send the request to the server and return the decoded content.
     *
     * @param string $url
     * @param string $method
     * @param string $data
     * @return array
     * @throws CatEngineConnectivityException
     */
    public function call($url, $method = 'POST', $data = null)
    {
        try {
            $options = ['headers' => ['Content-Type' => 'application/json']];
            if ($data != null) {
                if (!is_string($data)) {
                    throw new CatEngineException('The request body has to a string to request the url ' . $this->buildUrl($url));
                }
                $options['body'] = $data;
            }

            $response = $this->getCatClient()->request($method, $this->buildUrl($url), $options);

            if (!preg_match('/2\d\d/', (string) $response->getStatusCode())) {
                throw new CatEngineException(
                    'The CAT engine server cannot handle the request to ' . $this->buildUrl($url) .
                    (isset($options['body']) ? ' with data (' . $options['body'] . ')' : ' (No body data)')
                );
            }

            return json_decode($response->getBody()->getContents(), true);
        } catch (\Exception $e) {
           throw new CatEngineConnectivityException('', 0, $e);
        }
    }

    /**
     * Get the CAT client.
     *
     * @return ClientInterface
     */
    protected function getCatClient()
    {
        return $this->client;
    }

    /**
     * Build the full url associated to relative $url
     *
     * @param $url
     * @return string
     */
    protected function buildUrl($url)
    {
        $version = $this->getVersion();

        return empty($version)
            ? $this->endpoint . '/'. $url
            : $this->endpoint . '/' . $version . '/' . $url;
    }

    /**
     * Get the api version used to connect to echo adapt
     *
     * @return string
     */
    protected function getVersion()
    {
        return $this->version;
    }

    /**
     * Factory method to create CatSection instance
     *
     * @param string $adaptiveSettingsRef
     * @param string|null $qtiUsageData
     * @param string|null $qtiMetaData
     * @return CatSection
     */
    abstract protected function createSection($adaptiveSettingsRef, $qtiUsageData = null, $qtiMetaData = null);
}
