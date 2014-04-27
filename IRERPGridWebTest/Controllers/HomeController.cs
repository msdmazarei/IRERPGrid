using IRERP.Web.Controls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace IRERPGridWebTest.Controllers
{
    public class HomeController : Controller
    {
        protected override IAsyncResult BeginExecute(System.Web.Routing.RequestContext requestContext, AsyncCallback callback, object state)
        {
          
            return base.BeginExecute(requestContext, callback, state);
        }
        public ActionResult Index()
        {
            return View();
        }
        

        public ActionResult About()
        {
            ViewBag.Message = "Your app description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
    }
}
