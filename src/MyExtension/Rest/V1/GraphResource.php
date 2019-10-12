<?php
namespace RubedoAPI\Rest\V1;
use Rubedo\Collection\AbstractLocalizableCollection;
use Rubedo\Services\Manager;
use RubedoAPI\Entities\API\Definition\FilterDefinitionEntity;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use RubedoAPI\Exceptions\APIAuthException;
use RubedoAPI\Exceptions\APIEntityException;
use RubedoAPI\Exceptions\APIRequestException;
use WebTales\MongoFilters\Filter;
use Rubedo\Content\Context;

/**
 * Class GraphResource
 * @package RubedoAPI\Rest\V1
 */
class GraphResource extends AbstractResource
{
    /**
     * Cache lifetime for api cache (only for get and getEntity)
     * @var int
     */
    public $cacheLifeTime=60;

    /**
     * { @inheritdoc }
     */
    public function __construct()
    {
        parent::__construct();
        //$this->define();
    }
    /**
     * Get to contents
     *
     * @param $params
     * @return array
     * @throws \RubedoAPI\Exceptions\APIEntityException
     */
    public function getAction($params) {
        return "coco";
    }

    /**
     * Define the resource
     */
    protected function define()
    {
        $this
            ->definition
            ->setName('Contents')
            ->setDescription('Deal with contents')
            ->editVerb('get', function (VerbDefinitionEntity &$definition) {
                $this->defineGet($definition);
            })
            ->editVerb('post', function (VerbDefinitionEntity &$definition) {
                $this->definePost($definition);
            })
            ->editVerb('patch', function (VerbDefinitionEntity &$definition) {
                $this->definePatch($definition);
            });
        $this
            ->entityDefinition
            ->setName('Content')
            ->setDescription('Works on single content')
            ->editVerb('get', function (VerbDefinitionEntity &$definition) {
                $this->defineEntityGet($definition);
            })
            ->editVerb('patch', function (VerbDefinitionEntity &$definition) {
                $this->defineEntityPatch($definition);
            });
    }
    /**
     * Define get action
     *
     * @param VerbDefinitionEntity $definition
     */
    protected function defineGet(VerbDefinitionEntity &$definition)
    {
        $definition
            ->setDescription('Get a list of contents')
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('queryId')
                    ->setRequired()
                    ->setDescription('Id of the query')
                    ->setFilter('\\MongoId')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('siteId')
                    ->setDescription('Id of the site')
                    ->setFilter('\\MongoId')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('pageId')
                    ->setDescription('Id of the page')
                    ->setFilter('\\MongoId')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('detailPageId')
                    ->setDescription('Id of the linked page')
                    ->setFilter('\\MongoId')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('fields')
                    ->setDescription('Mask of fields')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('foContributeMode')
                    ->setDescription('Return only contents of current user, include drafts')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('dateFieldName')
                    ->setDescription('Name of the date field for the query')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('endDateFieldName')
                    ->setDescription('Name of the endDate field for the query')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('useDraftMode')
                    ->setDescription('Set to true to preview draft contents')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('simulatedTime')
                    ->setDescription('Simulate time to view future or past contents')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('date')
                    ->setDescription('Date filter for the query')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('endDate')
                    ->setDescription('endDate filter for the query')
            )->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('requiredFields')
                    ->setDescription('Array of required fields used to further refine the results')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('start')
                    ->setDescription('Item\'s index number to start')
                    ->setFilter('int')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('limit')
                    ->setDescription('How much contents to return')
                    ->setFilter('int')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('contextContentId')
                    ->setDescription('Context content id')
                    ->setFilter('\\MongoId')
            )->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('contextualTaxonomy')
                    ->setDescription('Context taxonomy array')
            )->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('contextualTaxonomyRule')
                    ->setDescription('Context taxonomy rule ')
            )->addInputFilter(
                (new FilterDefinitionEntity())
                ->setKey('includetl')
                ->setDescription('Retrieve terms labels')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                ->setKey('orderByTitle')
                ->setDescription('Trier par titre pour listes de produits')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('specialOffersOnly')
                    ->setDescription('Vrai pour récupérer seulement les promotions')
            )
            ->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('contents')
                    ->setDescription('List of contents')
            )
            ->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('count')
                    ->setDescription('Number of all contents')
            )->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('queryType')
                    ->setDescription('Query used by content list')
            )->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('usedContentTypes')
                    ->setDescription('Query used by content list')
            );
    }
    /**
     * Define post
     *
     * @param VerbDefinitionEntity $definition
     */
    protected function definePost(VerbDefinitionEntity &$definition)
    {
        $definition
            ->setDescription('Post a new content')
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('The content to post')
                    ->setKey('content')
                    ->setMultivalued()
            )->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('Content creation result')
                    ->setKey('data')
            )->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('Input errors')
                    ->setKey('inputErrors')
            )
            ->identityRequired();
    }
    protected function definePatch(VerbDefinitionEntity &$definition)
    {
        $definition->setDescription('Patch a list of contents')
            ->addInputFilter(
                (new FilterDefinitionEntity())
                ->setDescription('Contents to patch')
                ->setKey('contents')
            )
            ->identityRequired()
            ->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('List of new versions of contents send')
                    ->setKey('versions')
                    ->setRequired()
            );
    }
    /**
     * Define get entity
     *
     * @param VerbDefinitionEntity $definition
     */
    protected function defineEntityGet(VerbDefinitionEntity &$definition)
    {
        $definition
            ->setDescription('Get a content')
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('Fields to return')
                    ->setKey('fields')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('siteId')
                    ->setDescription('Id of the site')
                    ->setFilter('\\MongoId')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('pageId')
                    ->setDescription('Id of the page')
                    ->setFilter('\\MongoId')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('useDraftMode')
                    ->setDescription('Set to true to preview draft contents')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('fingerprint')
                    ->setDescription('Fingerprint')
            )->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('includeTermLabels')
                    ->setDescription('Include labels for taxonomy terms')
            )
            ->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('The content')
                    ->setKey('content')
                    ->setRequired()
            );
    }
    /**
     * Define get entity
     *
     * @param VerbDefinitionEntity $definition
     */
    protected function defineEntityPatch(VerbDefinitionEntity &$definition)
    {
        $definition
            ->setDescription('Patch a content')
            ->identityRequired()
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('The content')
                    ->setKey('content')
                    ->setRequired()
            )
            ->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('The content')
                    ->setKey('version')
                    ->setRequired()
            )->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('Input errors')
                    ->setKey('inputErrors')
            );
    }
    /**
     * Add product filter
     *
     * @return $this
     */
    protected function productFilter()
    {
        return Filter::factory('Or')
            ->addFilter(Filter::factory('OperatorToValue')->setName('isProduct')->setOperator('$exists')->setValue(false))
            ->addFilter(Filter::factory('Value')->setName('isProduct')->setValue(false));
    }
}

?>