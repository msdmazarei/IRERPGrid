using System.Web;
using System.Web.Optimization;

namespace IRERPGridWebTest
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/libraries").Include(
                        "~/Scripts/jquery.js",
                        "~/Scripts/underscore.js",
                        "~/Scripts/backbone.js",
                        "~/Scripts/q.js"));

            bundles.Add(new ScriptBundle("~/bundles/IRERPGrid").Include(
                        "~/Scripts/IRERPGrid/GridDataSource.js",
                        "~/Scripts/IRERPGrid/GridHeader.js",
                        "~/Scripts/IRERPGrid/GridPager.js",
                        "~/Scripts/IRERPGrid/GridTable.js",
                        "~/Scripts/IRERPGrid/Grid.js",
                        "~/Scripts/IRERPGrid/IRERPGrid.js"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                "~/Content/css/reset.css",
                "~/Content/css/style.css",
                "~/Content/css/font-awesome.css"));

            // BundleTable.EnableOptimizations = true;
        }
    }
}