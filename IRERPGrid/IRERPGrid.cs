using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DotLiquid;
using Newtonsoft.Json;
using System.Data;
using IRERP.Web.Controls.Tags;
using MsdLib.CSharp.BLLCore;
namespace IRERP.Web.Controls
{

    [LiquidType("Name", "Columns", "Totalpages", "Pageindex", "Pagesize", "Totalitems", "Divcontainerid",
        "Tabledataid", "Fromitemindex", "Toitemindex", "Columns", "DataColunms", "Orders", "Criterias",
        "Width")]

    public class IRERPGrid
    {
        public static DataTable GetDataTable(IRERPGrid Grid, IList datas)
        {
            DataTable dt = new System.Data.DataTable();
            string[] cols = null;
            //Create Structure
            List<string> lststring = new List<string>();

            if (Grid.Datacolumns != null && Grid.Datacolumns.Count > 0)
            {
                Grid.Datacolumns.ForEach(x => lststring.Add(x.Name));
                cols = lststring.ToArray();
            }

            else if (Grid.Columns != null && Grid.Columns.Count > 0)
            {
                List<string> c = new List<string>();
                Grid.Columns.ForEach(x => c.Add(x.Name));
                cols = c.ToArray();
            }
            Type datasBeanType = IRERP_RestAPI.Bases.IRERPApplicationUtilities.GetGenericTypeConstructor(datas.GetType(),0);
            //Create Columns
            foreach (string str in cols)
            {
                DataColumn dcol = new DataColumn(str, IRERP_RestAPI.Bases.IRERPApplicationUtilities.GetClassPropertyType(datasBeanType, str));
                dt.Columns.Add(dcol);
            }
            foreach (object o in datas)
            {
                List<object> colsvalue = new List<object>();
                foreach (string str in cols)
                    colsvalue.Add(IRERP_RestAPI.Bases.IRERPApplicationUtilities.GetProperty(o, str));
                dt.Rows.Add(colsvalue.ToArray());

            }
            return dt;
        }
        [JsonIgnore]
        public IList __datas = null;
        public static IList defaultGetDataList(IRERPGrid Grid)
        {
            if (Grid.__datas != null) return Grid.__datas;
            if (Grid.DatasRepository != null && Grid.DatasRepository.IndexOf("()") > 0)
            {
               IList Datas= (IList)General.CallStaticMethod(Grid.DatasRepository);
               if (Datas!=null &&
                   IRERP_RestAPI.Bases.IRERPApplicationUtilities.IsSubclassOfRawGeneric(typeof(IRERP_RestAPI.Bases.DataVirtualization.IRERPVList<,>),
                   Datas.GetType()))
               {
                   dynamic __datas = Datas;
                   dynamic filter = __datas.Filter;
                   if (filter.Orders == null) filter.Orders = new List<OrderBy>();
                   if (Grid.Orders.Count > 0)
                   foreach (var o in Grid.Orders)
                       filter.Orders.Add(o.ToOrderBy());
                   if (filter.Criterias == null) filter.Criterias = new List<MsdCriteria>();

                   if (Grid.Criterias!=null && Grid.Criterias.Count > 0)
                       foreach (var c in Grid.Criterias)
                           filter.Criterias.Add(c);
                   __datas.Filter = filter;
                   Grid.__datas = __datas;

               }
               else
                //Check that Datas is MsdVirtualCollection or not(that sorts and criterias supports in db
               if (
                   (Grid.Orders != null && Grid.Orders.Count > 0)
                   ||
                   (Grid.Criterias != null && Grid.Criterias.Count > 0)
                   )
               {
                   DataTable dt = GetDataTable(Grid, Datas);
                   if (Grid.Orders != null && Grid.Orders.Count > 0)
                   {
                       //Do Sort
                       string sortexpr = "";
                       Grid.Orders.ForEach(x=> sortexpr+=x.Columnname+" "+x.Ordertype.ToString()+",");
                       sortexpr = sortexpr.Substring(0, sortexpr.Length - 1);
                       dt.DefaultView.Sort = sortexpr;


                   }
                   if (Grid.Criterias != null && Grid.Criterias.Count > 0)
                   {
                       //Do Criteria
                       List<string> whs = new List<string>();
                       foreach (var c in Grid.Criterias)
                           whs.Add("(" + General.MsdCritToWhereString(c) + ")");
                       string wh = string.Join(" and ", whs.ToArray());
                       dt.DefaultView.RowFilter = wh;
                   }
                   dt = dt.DefaultView.ToTable();
                   Datas = new List<DataRow>();
                   foreach (DataRow r in dt.Rows)
                       Datas.Add(r);
               }
               Grid.__datas = Datas;
               return Datas;

            }


            return null;
        }
        public class IRERPGridRendered
        {
            public string HTML { get; set; }
            public string JavaScript { get; set; }
            public string ToHtml()
            {
                string rtn = "";
                if (HTML != null) rtn += HTML;
                if (JavaScript != null)
                    rtn += "<script type='text/javascript' defer>" + JavaScript + "</script>";
                return rtn;
            }
        }
        public IRERPGrid()
        {
            Orders = new List<IRERPGrid_Order>();
            Columns = new List<IRERPGrid_Column>();
            Pagesize = 10;
            GetDataList = new GetDatas(IRERPGrid.defaultGetDataList);
        }
        public delegate IList GetDatas(IRERPGrid Grid);
        public virtual string Name { get; set; }
        public virtual string ViewName { get; set; }
        //Can Be Method like a.b.c() or can be property like a.v.c.d
        public virtual string DatasRepository { get; set; }
        public virtual string StartUpMethod { get; set; }
        public virtual void CallStartupMethod()
        {
            if (StartUpMethod != null && StartUpMethod.Trim() != "")
            General.CallStaticMethod(StartUpMethod);
        }
        public virtual List<IRERPGrid_Order> Orders { get; set; }
        public virtual List<MsdLib.CSharp.BLLCore.MsdCriteria> Criterias { get; set; }
        [JsonIgnore]
        public virtual GetDatas GetDataList { get; set; }
        public virtual List<IRERPGrid_Column> Datacolumns { get; set; }
        public virtual int Pagesize { get; set; }
        public virtual int Pageindex { get; set; }
        public virtual int Fromitemindex { get; set; }
        public virtual int Toitemindex { get; set; }
        public virtual int Totalitems
        {
            get
            {
                return GetDataList(this).Count;
            }
        }
        [JsonIgnore]
        public virtual int Totalpages
        {
            get
            {
                int totalitems = GetDataList(this).Count;
                int Div = totalitems / Pagesize;
                if ((totalitems % Pagesize) > 0) Div++;
                return Div;
            }
        }

        public virtual List<IRERPGrid_Column> Columns { get; set; }

        protected virtual void FillHtmlTemplateProperties()
        {
            string uniqpart = Guid.NewGuid().ToString().Replace("-", "");
            if (!(Divcontainerid != null && Divcontainerid.Trim() != ""))
                Divcontainerid = "Container-" + Name + "-" + uniqpart;
            if (!(Tabledataid != null && Tabledataid.Trim() != ""))
                Tabledataid = "TableData-" + Name + "-" + uniqpart;

        }
        public virtual IRERPGridRendered GetGridForHtmlPage(string templatepath = null)
        {
            Fromitemindex = 0;
            Toitemindex = Pagesize - 1;
            return RenderTemplate("FullHtmlRender\\Grid.tpl", "FullHtmlRender\\Grid.js.tpl", GetDatasToView(), templatepath);


        }
        void RegisterTags()
        {
            Template.RegisterTag<GetGridRowColumnValue>("GGRCV");
            Template.RegisterTag<ToJsonTag>("ToJson");
            Template.RegisterTag<MsdDebugTag>("MsdDebug");
            Template.RegisterTag<MsdInclude>("MsdInclude");
        }
        #region internal Usage

        protected virtual IList GetDatasToView()
        {
            IList lst = null;
            IList RetuenLst = null;

            if (GetDataList != null)
                lst = GetDataList(this);

            if (lst == null)
                RetuenLst = new List<object>();

            if (lst.Count == 0) new List<object>();

            if (IRERP_RestAPI.Bases.IRERPApplicationUtilities.IsSubclassOfRawGeneric(typeof(IRERP_RestAPI.Bases.DataVirtualization.IRERPVList<,>), lst.GetType()))
            {
                RetuenLst = new List<object>();
            }
            else
            RetuenLst = (IList)Activator.CreateInstance(lst.GetType());

            int FromItem = Pagesize * Pageindex;
            int ToItem = FromItem + Pagesize;
            if (ToItem > lst.Count - 1) ToItem = lst.Count - 1;
            for (int i = FromItem; i <= ToItem; i++)
            {
                RetuenLst.Add(lst[i]);
            }


            return RetuenLst;
        }
        public static object GetColumnValue(object row, IRERPGrid_Column col)
        {
            object rtn = null;
            if (row != null)
            {
                if (row.GetType() == typeof(DataRow))
                {
                    int ind = ((DataRow)row).Table.Columns.IndexOf(col.Name);
                    rtn = ((DataRow)row).ItemArray[ind];
                }
                else
                    rtn = IRERP_RestAPI.Bases.IRERPApplicationUtilities.GetProperty(row, col.Name);
            }
            return rtn;

        }

        #endregion

        #region Template Usage
        public virtual string Divcontainerid
        {
            get;
            set;
        }
        public virtual string Tabledataid
        {
            get;
            set;
        }
        #endregion
        public virtual IRERPGridRendered RenderTemplate(

            string GridHtmlTemplateName, string JavaScriptTemplaeName, IList inpGridData, string templatepath = null
            )
        {
            FillHtmlTemplateProperties();

            IRERPGridRendered rtn = new IRERPGridRendered();
            if (Datacolumns == null)
                if (Columns != null && Columns.Count > 0)
                    Datacolumns = Columns;

            RegisterTags();
            if (GridHtmlTemplateName.IndexOf('\\') != 0)
                GridHtmlTemplateName = "\\" + GridHtmlTemplateName;
            if (JavaScriptTemplaeName.IndexOf('\\') != 0)
                JavaScriptTemplaeName = "\\" + JavaScriptTemplaeName;


            string template = "";
            string BrowerName = "Templates\\FireFox";
            if (templatepath != null) BrowerName = templatepath + "\\" + BrowerName;
            if (System.IO.File.Exists(BrowerName + GridHtmlTemplateName))
            {
                Template.FileSystem = new IRERPGrid_DotLiquidFileSystem(BrowerName);
                //Html Section
                template = System.IO.File.ReadAllText(BrowerName + GridHtmlTemplateName);
                Template TMP = Template.Parse(template);
                rtn.HTML = TMP.Render(Hash.FromAnonymousObject(new { Grid = this, GridData = inpGridData }));
                //POJOs
                template = System.IO.File.ReadAllText(BrowerName + JavaScriptTemplaeName);
                TMP = Template.Parse(template);
                rtn.JavaScript = TMP.Render(Hash.FromAnonymousObject(new { Grid = this, GridData = GetDatasToView() }));

            }
            return rtn;

        }
        public virtual IRERPGridRendered Fetch(
            int From,
            int Count,
            List<IRERPGrid_Order> sorts,
            List<MsdLib.CSharp.BLLCore.MsdCriteria> crits,
            string templatepath = null
            )
        {
            IRERPGridRendered rtn = new IRERPGridRendered();
            this.Orders = sorts;
            this.Criterias = crits;

            if (From < 0)
            {
                rtn.JavaScript = General.ToSimpleJSON(
                new { ErrorCode = -10, ErrorMessage = "From is less than 0, From valid values are 0 or greater than 0" }
                );
                return rtn;
            }
            if (Count < 0)
            {
                rtn.JavaScript = General.ToSimpleJSON(
new { ErrorCode = -11, ErrorMessage = "Count is less than 0, Count valid values are 1 or greater" }
);
                return rtn;
            }
            try
            {
                IList datas = GetDataList(this);
                if (From > datas.Count - 1)
                {
                    rtn.JavaScript = General.ToSimpleJSON(
new { ErrorCode = -12, ErrorMessage = "From is greater than Repository datas count." }
);
                    return rtn;
                }
                if (From + Count > datas.Count)
                {
                    Count
                         = datas.Count - From;
                }

                IList RetuenLst;

                if (IRERP_RestAPI.Bases.IRERPApplicationUtilities.IsSubclassOfRawGeneric(typeof(IRERP_RestAPI.Bases.DataVirtualization.IRERPVList<,>), datas.GetType()))
                {
                    RetuenLst = new List<object>();
                }
                else
                    RetuenLst = (IList)Activator.CreateInstance(datas.GetType());
                for (int i = From; i < From + Count; i++)
                    RetuenLst.Add(datas[i]);
                Fromitemindex = From;
                Toitemindex = From + Count - 1;
                Pageindex = From / Pagesize;
                //Render Templates
                return
                    RenderTemplate("Fetch\\Grid.tpl", "Fetch\\Grid.js.tpl", RetuenLst, templatepath);


            }
            catch (Exception ex)
            {
                rtn.JavaScript = General.ToSimpleJSON(
                    new
                    {
                        ErrorCode = -1,
                        ErrorMessage = ex.Message
                    }
                );
                return rtn;
            }

            return rtn;
        }

        public string Width { get; set; }
    }
}
