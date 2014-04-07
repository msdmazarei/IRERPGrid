﻿using DotLiquid;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using IRERP.Web.Controls;
using System.Collections;
namespace TestIRERPGrid
{
    class Program
    {
        public static IList TestDataRepo()
            {
                List<Type> lst = new List<Type>();
                try
                {
                    AppDomain.CurrentDomain.GetAssemblies().ToList().ForEach(y => { lst.AddRange(y.GetTypes()); });
                }
                catch { }

                return lst;

            }
        
        static void Main(string[] args)
        {
            IRERP.Web.Controls.IRERPGrid grd = new IRERP.Web.Controls.IRERPGrid() {Name = "Masoud"};
            grd.DatasRepository = "TestIRERPGrid.Program.TestDataRepo()";
            grd.Columns = new List<IRERPGrid_Column>();
            grd.Columns.Add(new IRERPGrid_Column() { Name = "Name" });
            grd.Columns.Add(new IRERPGrid_Column() { Name= "FullName" });

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