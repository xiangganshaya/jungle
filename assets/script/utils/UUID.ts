/*
 *
 * uuid.js - Version 0.3 JavaScript Class to create a UUID like identifier
 *
 * Copyright (C) 2006-2008, Erik Giberti (AF-Design), All rights reserved.
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation; either version 2 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, write to the Free Software Foundation, Inc., 59 Temple
 * Place, Suite 330, Boston, MA 02111-1307 USA
 *
 * The latest version of this file can be downloaded from
 * http://www.af-design.com/resources/javascript_uuid.php
 *
 * HISTORY: 6/5/06 - Initial Release 5/22/08 - Updated code to run faster,
 * removed randrange(min,max) in favor of a simpler rand(max) function. Reduced
 * overhead by using getTime() method of date class (suggestion by James Hall).
 * 9/5/08 - Fixed a bug with rand(max) and additional efficiencies pointed out
 * by Robert Kieffer http://broofa.com/
 *
 * KNOWN ISSUES: - Still no way to get MAC address in JavaScript - Research into
 * other versions of UUID show promising possibilities (more research needed) -
 * Documentation needs improvement
 *
 */

// On creation of a UUID object, set it's initial value



export default class UUID {
    //
    // INSTANCE SPECIFIC METHODS
    //

    public static createUUID() {
        //
        // Loose interpretation of the specification DCE 1.1: Remote Procedure Call
        // described at
        // http://www.opengroup.org/onlinepubs/009629399/apdxa.htm#tagtcjh_37
        // since JavaScript doesn't allow access to internal systems, the last 48
        // bits
        // of the node section is made up using a series of random numbers (6 octets
        // long).
        //
        let dg = new Date(1582, 10, 15, 0, 0, 0, 0);
        let dc = new Date();
        let t = dc.getTime() - dg.getTime();
        let tl = UUID.getIntegerBits(t, 0, 31);
        let tm = UUID.getIntegerBits(t, 32, 47);
        let thv = UUID.getIntegerBits(t, 48, 59) + '1'; // version 1, security version is 2
        let csar = UUID.getIntegerBits(UUID.rand(4095), 0, 7);
        let csl = UUID.getIntegerBits(UUID.rand(4095), 0, 7);

        // since detection of anything about the machine/browser is far to buggy,
        // include some more random numbers here
        // if NIC or an IP can be obtained reliably, that should be put in
        // here instead.
        let n = UUID.getIntegerBits(UUID.rand(8191), 0, 7)
            + UUID.getIntegerBits(UUID.rand(8191), 8, 15)
            + UUID.getIntegerBits(UUID.rand(8191), 0, 7)
            + UUID.getIntegerBits(UUID.rand(8191), 8, 15)
            + UUID.getIntegerBits(UUID.rand(8191), 0, 15); // this last number is two octets long
        return tl + tm + thv + csar + csl + n;
    }

    //
    // GENERAL METHODS (Not instance specific)
    //

    // Pull out only certain bits from a very large integer, used to get the time
    // code information for the first part of a UUID. Will return zero's if there
    // aren't enough bits to shift where it needs to.
    private static getIntegerBits(val, start, end) {
        let base16 = UUID.returnBase(val, 16);
        let quadArray = new Array();
        let quadString = '';
        let i = 0;
        for (i = 0; i < base16.length; i++) {
            quadArray.push(base16.substring(i, i + 1));
        }
        for (i = Math.floor(start / 4); i <= Math.floor(end / 4); i++) {
            if (!quadArray[i] || quadArray[i] == '')
                quadString += '0';
            else
                quadString += quadArray[i];
        }
        return quadString;
    }

    // Replaced from the original function to leverage the built in methods in
    // JavaScript. Thanks to Robert Kieffer for pointing this one out
    private static returnBase(number, base) {
        return (number).toString(base).toUpperCase();
    }

    // pick a random number within a range of numbers
    // int b rand(int a); where 0 <= b <= a
    private static rand(max) {
        return Math.floor(Math.random() * (max + 1));
    }

}
