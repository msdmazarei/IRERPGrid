using DotLiquid;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using IRERP.Web.Controls;
namespace TestIRERPGrid
{
    class Program
    {
        static void Main(string[] args)
        {
            IRERP.Web.Controls.IRERPGrid grd = new IRERP.Web.Controls.IRERPGrid() {Name = "Masoud"};
            grd.Columns = new List<IRERPGrid_Column>();
            grd.Columns.Add(new IRERPGrid_Column() { Name = "Masoud" });
            grd.Columns.Add(new IRERPGrid_Column() { Name= "Mazarei" });

            Console.WriteLine(grd.GetGridForHtmlPage());
            Console.ReadLine();
        /*    Template template = Template.Parse("hi {{name}}");  // Parses and compiles the template
            Hash a = new Hash();
            a.Add("name", "tobi");
            Console.WriteLine(
                template.Render(a)
                ); // Renders the output => "hi tobi"*/
        }
    }
}
