using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace IRERPGridWebTest.Areas.IRERPControls.Controllers
{
    public class IRERPGridController : Controller
    {
        //
        // GET: /IRERPControls/IRERPGrid/
        public ActionResult Next()
        {
            string gridName = IRERP_RestAPI.Bases.IRERPApplicationUtilities.GetHttpParameter("GridName");
            if (gridName != null)
            {
                var Grid = IRERP.Web.Controls.General.GetGrid(gridName);
                Grid.Pageindex++;
                string response = Grid.GetGridForHtmlPage(IRERP_RestAPI.Bases.IRERPApplicationUtilities.PhysicalApplicationPath()+"\\bin");
                return new IRERP_RestAPI.Bases.IRERPActionResults.IRERPMethodActionResult()
                {
                    Success = true,
                    data = response
                };
            }
            return null;
        }
    }
}
