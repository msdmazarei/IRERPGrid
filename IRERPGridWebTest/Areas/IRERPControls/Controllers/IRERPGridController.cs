using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using IRERP.Web.Controls;
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
                var response = Grid.GetGridForHtmlPage(IRERP_RestAPI.Bases.IRERPApplicationUtilities.PhysicalApplicationPath()+"\\bin");
                IRERP.Web.Controls.General.StoreGrid(Grid);
                return new IRERP_RestAPI.Bases.IRERPActionResults.IRERPMethodActionResult()
                {
                    Success = true,
                    data = response
                };
            }
            return null;
        }
        public ActionResult Fetch()
        {
            string gridName = IRERP_RestAPI.Bases.IRERPApplicationUtilities.GetHttpParameter("GridName");
            if (gridName != null)
            {
                var Grid = IRERP.Web.Controls.General.GetGrid(gridName);
                string From = IRERP_RestAPI.Bases.IRERPApplicationUtilities.GetHttpParameter("From");
                string Count = IRERP_RestAPI.Bases.IRERPApplicationUtilities.GetHttpParameter("Count");
                string orders = IRERP_RestAPI.Bases.IRERPApplicationUtilities.GetHttpParameter("ColumnsSorts");
                string ClientColumnCriteria = IRERP_RestAPI.Bases.IRERPApplicationUtilities.GetHttpParameter("ClientColumnCriteria");

                if (orders != null)
                {
                    if (Grid.Orders == null) Grid.Orders = new List<IRERP.Web.Controls.IRERPGrid_Order>();
                    Grid.Orders.AddRange(Newtonsoft.Json.JsonConvert.DeserializeObject<IRERP.Web.Controls.IRERPGrid_Order[]>(orders));
                }
                if (ClientColumnCriteria!=null)
                {
                    var clientcolumncrits = IRERP.Web.Controls.General.DeSerializeFromJson<ClientColumnCriteria[]>(ClientColumnCriteria);

                    var clientcolumncritgrammar = new IRERP.Web.Controls.IRERPGridColCriteriaGrammar();
                    List<ClientColumnCriteria> ccc = new List<ClientColumnCriteria>();
                    List<ClientColumnCriteria> ErrorClientColumnCriteria = new List<ClientColumnCriteria>();
                    foreach (var c in clientcolumncrits)
                    {

                        if (
                            IRERP.Web.Controls.General.CorrectInGrammar(clientcolumncritgrammar, c.Condition)
                            )
                            ccc.Add(c);
                        else
                            ErrorClientColumnCriteria.Add(c);
                    }
                    if (Grid.Criterias == null)
                        Grid.Criterias = new List<MsdLib.CSharp.BLLCore.MsdCriteria>();
                    foreach (var c in ccc)
                        Grid.Criterias.Add(c.GetMsdCrit());
                    
                }

                 
                     
                var response = Grid.Fetch(int.Parse(From), int.Parse(Count), Grid.Orders, null,
                    IRERP_RestAPI.Bases.IRERPApplicationUtilities.PhysicalApplicationPath() + "\\bin");
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
