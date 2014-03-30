using System.Web.Mvc;

namespace IRERPGridWebTest.Areas.IRERPControls
{
    public class IRERPControlsAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get
            {
                return "IRERPControls";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
            context.MapRoute(
                "IRERPControls_default",
                "IRERPControls/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
