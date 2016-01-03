/// <reference path="../angularjs/angular.d.ts" />
/// <reference path="../oclazyload/oclazyload.d.ts" />
/// <reference path="../angular-ui-router/angular-ui-router.d.ts" />
/**
 * This file should contain commonly used interfaces and classes.
 */
declare module Common {
    /**
     * Each module may implement that interface and its factory method createModule()
     * is supposed to return the module.
     */
    interface IModuleFactory {
        createModule(): angular.IModule;
    }
    /**
     * Class used to encapsulate constants as they're not automagically
     * populated using TypeScript.
     */
    class Constants {
        private values;
        constructor();
        add<T>(key: string, value: T): Constants;
        get<T>(key: string, defaultIfMissing?: T): T;
    }
    /**
     * Temporary interface to describe the ui-router's $templateFactory. This is
     * necessary because this definition is missing from the d.ts.
     */
    interface $TemplateFactory {
        fromUrl(url: string): angular.IPromise<string>;
    }
    /**
     * Dedicated interface that represents the structure of our global content.json.
     * It contains meta-articles and meta-fragments and allows us to make extensions
     * later if required:
     */
    interface ContentJSON {
        mydeps: {
            path: (string | oc.ITypedModuleConfig);
        }[];
        metaArticles: MetaArticle[];
        metaFragments: MetaFragment[];
    }
    interface Meta extends Common.IKVStore<any> {
        author?: string;
        copyright?: string;
        description?: string;
        keywords?: string;
        score?: number;
    }
    interface MetaArticle extends Meta {
        path: string;
        lastMod: string;
        urlName: string;
        title: string;
    }
    /**
     * This class represents one Article which can be displayed by STAB.
     */
    class Article {
        private _metaArticle;
        private _original;
        private $sce;
        constructor(_metaArticle: MetaArticle, _original: string, $sce: angular.ISCEService);
        meta: MetaArticle;
        original: string;
        asJQuery: angular.IAugmentedJQuery;
        asTrustedHtml: any;
        /**
         * This function accepts a content transformer which can apply changes
         * to the original content of this article.
         */
        transformContent(transformer: ContentTransformer): Common.Article;
    }
    /**
     * This interface must be implemented by all content transformers. Instance
     * of it will be automatically picked up by the ContentService and applied
     * to any Article. The order of processing is however not guaranteed. Note
     * that if you want to provide your own, user-defined transformers, they must
     * be declared within the module/namespace 'Blog.Article'.
     */
    interface ContentTransformer {
        transform(original: string): string;
    }
    class Page<T> {
        items: T[];
        index: number;
        next: Page<T>;
        prev: Page<T>;
        constructor(items: T[], index: number);
        hasPrev(): boolean;
        hasNext(): boolean;
        /**
         * Takes a number of items and partitions them into pages by the
         * given chunk-size. All pages are linked together and the first
         * page is returned.
         */
        static partitionAndGetFirstPage<T1>(allItems: T1[], partSize?: number): Page<T1>;
    }
    /**
     * We might want to have different list-sites and each of them requires
     * different logic or filters.
     */
    abstract class AListStrategy {
        type: string;
        reverse: boolean;
        protected injected: IKVStore<any>;
        constructor(type: string, reverse: boolean);
        /**
         * This method supposedly returns an ordered array of meta-articles
         * based on the implemented strategy and given parameters.
         */
        abstract itemsList(source: MetaArticle[]): MetaArticle[];
        /**
         * This function may be used by a controller to inject parameters such
         * as search parameters.
         */
        inject(key: string, value: any): AListStrategy;
        /**
         * Static method that returns false by default. When a specific
         * list-type is requested, the designated controller will probe
         * all registered ListStrategies with this method. Each strategy
         * should override this static method.
         */
        static canHandle(listType: string): boolean;
    }
    class I2Tuple<T1, T2> {
        private _t1;
        private _t2;
        constructor(_t1: T1, _t2: T2);
        t1: T1;
        t2: T2;
    }
    interface IKVStore<T> {
        [key: string]: T;
    }
    /**
     * Describes a fragment's meta information.
     */
    interface MetaFragment {
        id: string;
        path?: string;
        content?: any;
        mime?: string;
    }
    /**
     * This class represents a fragment.
     */
    class Fragment {
        private _meta;
        private _original;
        private $sce;
        private trusted;
        private static supportedMimeTypesArray;
        constructor(_meta: MetaFragment, _original: string, $sce: angular.ISCEService);
        meta: MetaFragment;
        /**
         * Getter for the trusted value of the fragment.
         */
        trustedValue: any;
        static supportedMimeTypes: string[];
    }
}
