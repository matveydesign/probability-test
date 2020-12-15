var app = new Vue({
    el: '#app',
    data: {
        darkmode:null,

        loading:false,
        refDate: true,
        net: 0,
        tD :0,
        lastDraw :0,
        lastResult :0,
        lengthrow :5,
        numberballs :50,
        layers :'5,5,6',

        result_group :"",
        result_group_winning : "",
        result_group_winningAndRef : "",
        result_group_refs : "",
        result_group_numbers : [],
        result_group_numbersToPlay : [],
        result_group_selected_number : [],

        diagram : "",
        output : "",
        inputData : `
        3	8	16	40	43	1
        1	29	33	45	47	2
        14	27	39	46	48	3
        5	25	34	48	50	4
        15	27	33	39	50	5
        `,
        subgroups : {
            'All':{
                winning:[],
                winningAndRef:[],
                refs:[]
            }
        },
        selectedGroup:'',
        groupKeys : [],
        workplaces : [],
        selectedWorkplace : {},
        matrix : []
    },
    mounted() {
        this.darkmode = eval(localStorage.getItem('darkmode'));
        const workplaces = JSON.parse(localStorage.getItem('workplaces'));
        console.log('work', workplaces)
        if(workplaces === null){
            this.workplaces.push(
                {
                    name:'General',
                    refDate:true,
                    inputData : `
                    3	8	16	40	43	1
                    1	29	33	45	47	2
                    14	27	39	46	48	3
                    5	25	34	48	50	4
                    15	27	33	39	50	5
                    `,
                    layers : '5,5,6',
                    lengthrow :5,
                    numberballs :50,
                    groupsConfig : '10,20,30,40,50'
                }
            );

            localStorage.setItem('workplaces', JSON.stringify(this.workplaces));
        }else{
            this.workplaces = workplaces;
        }
        
    },  
    computed: {
    },
    methods: {
        selectnumber(selectednumber){

            if(this.result_group_selected_number.includes(selectednumber)){
                //remove number
                this.result_group_selected_number = this.result_group_selected_number.filter(item => item !== selectednumber)
            }else{
                //add number
                this.result_group_selected_number.push(selectednumber);
            }
        },

        getMatrixValueWithTableFormate(row,col) {

            const value = this.getMatrixValue(row,col);

            return (value > 0 ? "<b style='color:red'>"+value+"</b>" : "<span style='color:grey'>"+value+"</span>");
        },
        getMatrixValue(row,col) {
            if(this.matrix[row] === undefined){
                return 0;
            }
            if(this.matrix[row][col] === undefined){
                return 0;
            }
            if(this.matrix[row][col] === null){
                return 0;
            }

            return this.matrix[row][col];
        },
        addWorkPlace(){
            var workplaceName = prompt("Please enter a name For the Workplace:", "");
            if (workplaceName == null || workplaceName == "") {
              alert("the name can not be empty !");
            }else if(this.workplaces.find(o => o.name === workplaceName)){

                alert("Name already exist !");

            }else {

                this.workplaces.push({
                    name:workplaceName,
                    refDate:true,
                    inputData : "3	8	16	40	43	1 1	29	33	45	47	2 14	27	39	46	48	3 5	25	34	48	50	4 15	27	33	39	50	5",
                    layers : '5,5,6',
                    lengthrow :5,
                    numberballs :50,
                    groupsConfig : '10,20,30,40,50'
                })
                localStorage.setItem('workplaces', JSON.stringify(this.workplaces));
                
            }
        },
        changeWorkPlace(item){
            this.selectedWorkplace = item;


            this.selectedGroup = "";
            this.diagram = "";
            this.output = "";

            if(item.groups !== undefined){
                //if groups where created previously, load them
                this.matrix = item.matrix;
                this.subgroups = item.groups;


            }else{

            //autogenerate the groups
            setTimeout(this.createGroups(),5000);
            }

            
        },
        saveWorkPlace(){
            var foundIndex = this.workplaces.findIndex(x => x.name == this.selectedWorkplace.name);
            this.workplaces[foundIndex] = this.selectedWorkplace;
            localStorage.setItem('workplaces', JSON.stringify(this.workplaces));
        },
        renameWorkPlace(){
            var workplaceName = prompt("Please enter a name For the Workplace:", this.selectedWorkplace.name);
            if (workplaceName == null || workplaceName == "") {
              alert("the name can not be empty !");
            }else if(this.workplaces.find(o => o.name === workplaceName)){

                alert("Name already exist !");

            }else {

                var foundIndex = this.workplaces.findIndex(x => x.name == this.selectedWorkplace.name);
                this.workplaces[foundIndex].name = workplaceName;
                localStorage.setItem('workplaces', JSON.stringify(this.workplaces));
            }
        },
        removeWorkPlace(){
            if (confirm("Are you sure you want to delete this workplace")) {
                txt = "You pressed OK!";
                if (this.workplaces.length === 1) {
                  alert("You can not remove the last workplace !");
                }else {
                    var filteredWorkplaces = this.workplaces.filter(x => x.name !== this.selectedWorkplace.name);
                    this.workplaces = filteredWorkplaces;
                    localStorage.setItem('workplaces', JSON.stringify(this.workplaces));
                }
              } else {
                txt = "You pressed Cancel!";
              }
        },


        //https://stackoverflow.com/questions/39927452/recursively-print-all-permutations-of-a-string-javascript
        permut(string) {
            if (string.length < 2) return string; // This is our break condition

            var permutations = []; // This array will hold our permutations

            for (var i=0; i<string.length; i++) {
                var char = string[i];

                // Cause we don't want any duplicates:
                if (string.indexOf(char) != i) // if char was used already
                    continue;           // skip it this time

                var remainingString = string.slice(0,i) + string.slice(i+1,string.length); //Note: you can concat Strings via '+' in JS

                for (var subPermutation of permut(remainingString))
                    permutations.push(char + subPermutation)

            }
            return permutations;
        },
        clean(s){
            r = s.replace(/\D/g,' ');
            r = r.replace(/\s\s+/g, ' ');
            return r;
        },
        zpadlen(n,len){
            return ("00000"+n).slice(-len);
        },
        zpad(n){
            return ("0000"+n).slice(-4);
        },
        zpad2(n){
            return ("0000"+n).slice(-2);
        },
        zpad3(n){
            return ("0000"+n).slice(-3);
        },
        zpad4(n){
            return ("0000"+n).slice(-4);
        },
        sumstr(s){
            r = 0;
            for (i=0;i<s.length;i++){
                r += parseInt(s[i]);
            }
            return r;
        },
        rootstr(s){
            n = parseInt(s);
            while (n > 9){
                n = sumstr(n+"") + "";
                n = parseInt(n);
            }
            return n;
        },
        tablerow(row){
            r = "<tr>"
            for (i=0;i<row.length;i++){
                r += "<td align='center'>"+row[i]+"</td>"
            }
            r += "</tr>";
            return r;
        },
        addstr(s1,s2){
            r = "";
            for (i=0;i<s1.length;i++){
                r+= "" + ((parseInt(s1[i]) + parseInt(s2[i]))%10);
            }
            return r;
        },
        subarr(a1,a2){
            r = [];
            for (i=0;i<a1.length;i++){
                r.push(parseInt(a1[i]) - parseInt(a2[i]));
            }
            return r;
        },
        addarr(a1, a2){
            r = [];
            for (i=0;i<a1.length;i++){
                r.push(parseInt(a1[i]) + parseInt(a2[i]));
            }
            return r; 
        },
        bracket_if_match(str,n){
            r = [];
            for (var i=0;i<str.length;i++){
                if (parseInt(str[i]) == parseInt(n)){
                r.push("(" + str[i] + ")");
                }else{
                r.push(str[i]);
                }
            }
            return r;
        },
        mirror(n){
            n = "" + n;
            r = "";
            for (var i=0;i<n.length;i++){
                r += ((parseInt(n[i])+5)%10) + "";
            }
            return r;
        },
        mirrorarr(ar){
            var r = [];
            for (var i=0;i<ar.length;i++){
                r.push(mirror(ar[i]));
            }
            return r;
        },
        intarr(ar){
            var re = [];
            for (var i=0;i<ar.length;i++){
                re.push(parseInt(ar[i]));
            }
            return re;
        },
        lotmat(ar){
            re = 0;
            for (i=0;i<ar.length;i++){
                re += parseInt(ar[i]);
            }
            re = re % 10;
            return re;
        },



        createnetwork(){
            hidlayers = eval("["+this.selectedWorkplace.layers+"]");
            this.net = new brain.NeuralNetwork({ hiddenLayers: hidlayers});
            outputt = "Neural Net created with Hidden Layers Shape ["+ hidlayers.join(",") +"]<br/>";
            this.output = outputt;

        },
        reverseInputLines(){
            input = this.selectedWorkplace.inputData;
            input = input.split("\n");
            input = input.reverse();
            input = input.join("\n");
            this.selectedWorkplace.inputData = input;
        },  

        highestProb(result,print=1){
            orderlst = [];
            for (var i=0;i<result.length;i++){
                orderlst.push([i+1,result[i]]);
            }
            orderlst = orderlst.sort(function(a,b){return b[1]-a[1]});
            lst = [];
            if (print==1){
                this.output += "Highest probability is: " + orderlst[0][1] + "<br/>";
                this.output += "Lowest probability is: " + orderlst[orderlst.length-1][1] + "<br/>";
            }
            for (var i=0;i<orderlst.length;i++){
                lst.push(orderlst[i][0]);
            }
            return lst;
        },
        trainnetwork(){
            
            //for (var i=0;i<1;i++){
            stats = this.net.train(this.tD);
            this.output = "Error:" + stats["error"] + " Iterations: " + stats['iterations'];
            this.output += "<br/>Trained.<br/>Run with last Draw result: " + this.lastDraw.join(", ") +"<br/>";

            this.diagram = brain.utilities.toSVG(this.net)

            this.runthrough();
        },

        runthrough(){
            lengthrow = +this.selectedWorkplace.lengthrow;
            result = this.net.run(this.lastResult);
            ordlst = this.highestProb(result);
            numbersToPlay = ordlst.slice(0,lengthrow);

            this.result_group_numbersToPlay = numbersToPlay;
            this.output += "From most likely to least likely: " + ordlst.join(', ') + "<br/>";
            //this.output += "Numbers to play: <b>" + numbersToPlay.join(' ') + "</b><br/>";
            this.output += "Numbers to play: <b>";

                for (let [index, val] of numbersToPlay.entries()) {
                    this.output += "<span class='table-number-to-play'>"+val+"</span>";
                }

            this.output += "</b><br/>";
            

            this.output += "Here are 10 sets ran in series:<br/>";
            nextResult = this.lastResult;
            balls = ordlst.length;
            numbers = numbersToPlay.length;


            this.output += "<table class='table' style='background-color: white; margin-top: 20px;'><tbody>";
            for (var i=0;i<lengthrow;i++){
                result = this.net.run(nextResult);
                ordlst = this.highestProb(result,print=0);
                thisSet = ordlst.slice(0,numbers);

                // this.output += "<b>"+thisSet.join(" ")+"</b><br/>";
                // nextResult = this.tD_Ones(balls,thisSet);

                this.output += "<tr>";
                for (let [index, val] of thisSet.entries()) {
                    this.output += "<td>"+val+"</td>";
                }
                this.output += "</tr>";
                nextResult = this.tD_Ones(balls,thisSet);
            }

            this.output += "</tbody></table>";

        },
        trainnetwork100(){
            for (var i=0;i<100;i++){
                this.net.train(this.tD);

            }
            this.output = "<br/>Trained 100x.<br/>Run with last Draw result: " + this.lastDraw.join(", ") +"<br/>";
            this.runthrough();
        },
        trainnetwork1000(){
            for (var i=0;i<1000;i++){
                this.net.train(this.tD);

            }
            this.output = "<br/>Trained 1000x.<br/>Run with last Draw result: " + this.lastDraw.join(", ") +"<br/>";
            this.runthrough();
        },
        readtrainingdata(){
            this.run();
        },
        tD_Ones(size,row){
            var res = [];
            for (var i=0;i<size;i++){
                res.push(0);
            }
            for (var i=0;i<row.length;i++){
                curindex = parseInt(row[i]) - 1;
                res[curindex] = 1;
            }
            return res;
        },

        changeResultGroup(name, values){

            this.selectedGroup = name;

            this.result_group = values.winning;

            this.result_group_winning = values.winning.join(" ");
            this.result_group_winningAndRef = values.winningAndRef;
            this.result_group_refs = values.refs;
            this.result_group_numbers = values.numbers;

            console.log('change group values', values);
            if(values.output !== undefined){
                setTimeout(() => {
                    console.log('change group values', values.output);
                    this.diagram = values.diagram;
                    this.output = values.output;
                    this.result_group_numbersToPlay = values.result_group_numbersToPlay;

                },300);
            }else{

                this.result_group_numbersToPlay = [];

            }
        },

        generateProportionTable(){
        },

        generateProportionMatrix(winningRow){


            lengthrow = +this.selectedWorkplace.lengthrow;
            for (var m=0;m<lengthrow;m++){

                if(this.matrix[winningRow[m]] === undefined){
                    this.matrix[winningRow[m]] = [];

                }
                if(this.matrix[winningRow[m]][m] === undefined){
                    this.matrix[winningRow[m]][m] = 1;
                }else{
                    this.matrix[winningRow[m]][m] += 1;
                }
            }
        },

        createGroups(){
            //reset default values
            this.matrix = [];
            this.result_group = "";
            this.result_group_winning = "";
            this.result_group_winningAndRef = "";
            this.result_group_refs = "";
            this.result_group_numbers = [];
            this.result_group_numbersToPlay = [];

            this.saveWorkPlace();

            //clear previous groups
            this.subgroups = {
                'All':{
                    winning:[],
                    winningAndRef:[],
                    refs:[],
                    numbers:[]
                }
            };

            // put them in groups of 6 for each item
            //create rows here
            check = this.selectedWorkplace.inputData;
            check = this.clean(check);
            checks = check.split(" ");
            var filtered = checks.filter(function (el) {//filter out empty
                return el != "";
            });
            inputs = filtered;
            lengthrow = +this.selectedWorkplace.lengthrow;
            

            for (var i=0;i<(Math.floor(inputs.length/(lengthrow+(this.selectedWorkplace.refDate?1:0) )));i++){

                //use last column as date ref column filter out the other numbers as winnings
                if(i === 0 || this.selectedWorkplace.refDate === false){
                    input = inputs.slice(i*lengthrow,i*lengthrow+lengthrow);
                    this.generateProportionMatrix(input);
                }else{
                    input = inputs.slice(i*(lengthrow+1),i*(lengthrow+1)+(lengthrow));
                    this.generateProportionMatrix(input);
                }
                //input = inputs.slice(i*lengthrow,i*lengthrow+lengthrow);

                if(this.selectedWorkplace.refDate === true){
                    inputWithRef = inputs.slice(i*(lengthrow+1),i*(lengthrow+1)+(lengthrow+1));
                    ref = inputs[i*lengthrow+(lengthrow+i)];

                }else{
                    inputWithRef = inputs.slice(i*lengthrow,i*lengthrow+lengthrow);
                    ref = i;
                }

                //get the ref column
                if(this.selectedWorkplace.refDate === true){
                    inputRef = inputs[i*lengthrow];
                }


                var groupsConfig1 = this.selectedWorkplace.groupsConfig;
                var groupsConfig = groupsConfig1.split(",");

                let groupNumbers = [];

                let subname = [];
                //for (var j=0;j<lengthrow;j++){
                for (var j=0;j<groupsConfig.length;j++){
                    subname.push(0)
                }


                input.forEach(element => {

                    let triggered = false;
                    groupNumbers.push(element);

                    for (let [index, val] of groupsConfig.entries()) {
                        if(triggered === false){
                            if(+element <= +val){
                                subname[+index] += 1;
                                triggered = true;
                            }
                        }
                    }
                    // if(element < 10){
                    //     subname[0] += 1;
                    // }else if(element < 20){
                    //     subname[1] += 1;
                    // }else if(element < 30){
                    //     subname[2] += 1;
                    // }else if(element < 40){
                    //     subname[3] += 1;
                    // }else if(element <= 50){
                    //     subname[4] += 1;
                    // }

                });


                subname = subname.join("-");
                if(this.subgroups[subname] === undefined){
                    this.subgroups[subname] = {};
                    this.subgroups[subname].name = '';
                    this.subgroups[subname].winning = [];
                    this.subgroups[subname].winningAndRef = [];
                    this.subgroups[subname].refs = [];
                    this.subgroups[subname].numbers = [];
                }
                this.subgroups[subname].name = subname;
                this.subgroups[subname].winning.push(input);
                this.subgroups[subname].winningAndRef.push(inputWithRef.join(" "));
                this.subgroups[subname].refs.push(ref);
                this.subgroups[subname].numbers = [...this.subgroups[subname]['numbers'],...groupNumbers];
                this.groupKeys.push(subname);



                this.subgroups.All.name = 'All';
                this.subgroups.All.winning.push(input);
                this.subgroups.All.winningAndRef.push(inputWithRef.join(" "));
                this.subgroups.All.refs.push(ref);
                this.subgroups.All.numbers = [...this.subgroups.All.numbers,...groupNumbers];

            }


            //save groups to localstorage
            this.selectedWorkplace.groups = this.subgroups;
            this.saveWorkPlace();

            console.log('subgroups',this.subgroups);
            //this.result_group_winning =this.groupKeys.join(" ");
        },
        run(){
            outputt = "";
            //check these numbers in 'check' element
            //lastdraw =  .getElementById('draw').value;
            check = this.result_group_winning;
            check = this.clean(check);
            checks = check.split(" ");
            var filtered = checks.filter(function (el) {//filter out empty
                return el != "";
            });
            checks = filtered;


            inputs = checks;

            //get row length
            lengthrow = +this.selectedWorkplace.lengthrow;
            

            //len = inputs[0].length; //Pick-3/Pick-4 indicator based on len.
            len = lengthrow;

            // put them in groups of 6 for each item
            //create rows here
            finputs = [];
            for (var i=0;i<(Math.floor(inputs.length/lengthrow));i++){

                //use last column as date ref column filter out the other numbers as winnings
                input = inputs.slice(i*lengthrow,i*lengthrow+lengthrow);
                finputs.push(input);

            }
            inputs = finputs;

            //inputs = inputs.reverse(); //reverse so that it's from oldest to newest
            balls = this.selectedWorkplace.numberballs;

            this.tD = [];
            for (var i=0;i<inputs.length-1;i++){
                tDin = this.tD_Ones(balls,inputs[i].slice(0,len));
                tDout = this.tD_Ones(balls,inputs[i+1].slice(0,len));
                this.tD.push({input:tDin,output:tDout});
            }
            this.lastDraw = inputs[inputs.length-1];
            console.log('[lastDraw]',inputs);
            this.lastResult = this.tD_Ones(balls,this.lastDraw.slice(0,len));
            outputt+="Read training data!";

            this.output = outputt;


        }



    },
    watch: {
        darkmode: function (val) {
            
            localStorage.setItem('darkmode', val);
            if (val) {
                document.documentElement.setAttribute('data-theme', 'dark');
            }
            else {
                document.documentElement.setAttribute('data-theme', 'light');
            } 
        },
        output: function (val) {

            //save groups to localstorage
            //console.log('selectedGroup',this.selectedGroup);
            if(val){

                this.selectedWorkplace.groups[this.selectedGroup].output = this.output;
                this.saveWorkPlace();
            }
        },
        matrix: function (val) {

            //save matrix inside groups in localstorage
            //console.log('matrix',val);

            if(val){

                this.selectedWorkplace.matrix = this.matrix;
                this.saveWorkPlace();
            }
        },
        diagram: function (val) {

            //save diagram inside groups to localstorage
            //console.log('diagram',this.diagram);

            if(val){

                this.selectedWorkplace.groups[this.selectedGroup].diagram = this.diagram;
                this.saveWorkPlace();
            }
        },
        result_group_numbersToPlay :  function (val) {

            //save diagram inside groups to localstorage
            //console.log('diagram',this.diagram);

            if(val){

                this.selectedWorkplace.groups[this.selectedGroup].result_group_numbersToPlay = val;
                this.saveWorkPlace();
            }
        }
    }
})


